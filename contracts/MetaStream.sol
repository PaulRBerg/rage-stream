pragma solidity =0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./sablier/ISablier.sol";

/**
 * @title MetaSablier
 * @author Ameen Soleimani
 * @notice Meta money streaming.
 */

contract MetaSablier is ERC20 {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    ISablier public sablier;
    uint256 public metaStreamId;
    address public owner;
    IERC20 public token;
    uint256[] public forks;

    constructor(address owner_, ISablier sablier_) public {
        owner = owner_;
        sablier = sablier_;
        _mint(msg.sender, 1000000);
    }

    function createStream(
        address recipient,
        uint256 deposit,
        IERC20 _token,
        uint256 startTime,
        uint256 stopTime
    ) external {
        require(metaStreamId == 0, "only one meta stream can be created");
        token = _token;

        _token.safeTransferFrom(owner, address(this), deposit);
        _token.approve(address(sablier), uint256(-1));
        metaStreamId = sablier.createStream(recipient, deposit, address(_token), startTime, stopTime);
    }

    function cancelStream() public {
        require(msg.sender == owner, "only owner is allowed to cancel metastream");
        sablier.cancelStream(metaStreamId);
        withdrawTokens();
    }

    function cancelForkStream(uint256 forkStreamIndex) public {
        require(msg.sender == owner, "only owner is allowed to cancel metastream");
        uint256 forkStreamId = forks[forkStreamIndex];
        sablier.cancelStream(forkStreamId);
        withdrawTokens();
    }

    function withdrawTokens() public {
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(owner, balance);
    }

    function rageStream(address newRecipient, uint256 tokensToBurn) public {
        require(balanceOf(msg.sender) >= tokensToBurn, "not enough tokens to burn");
        this.transferFrom(msg.sender, address(this), tokensToBurn);

        (, address metaRecipient, , , uint256 metaStartTime, uint256 metaStopTime, , ) = sablier.getStream(
            metaStreamId
        );
        sablier.cancelStream(metaStreamId);
        uint256 balance = token.balanceOf(address(this));
        token.approve(address(sablier), balance);

        // calculate the fork deposit amount
        uint256 metaDuration = metaStopTime.sub(metaStartTime);

        uint256 forkDeposit = tokensToBurn.mul(balance).div(this.totalSupply());
        uint256 forkDepositAdjusted = forkDeposit.sub(forkDeposit.mod(metaDuration));

        uint256 metaDeposit = balance.sub(forkDepositAdjusted);
        uint256 metaDepositAdjusted = metaDeposit.sub(metaDeposit.mod(metaDuration));

        // create a forked stream
        uint256 forkStreamId = sablier.createStream(
            newRecipient,
            forkDepositAdjusted,
            address(token),
            metaStartTime,
            metaStartTime
        );
        forks.push(forkStreamId);

        // re-create the main meta stream
        metaStreamId = sablier.createStream(
            metaRecipient,
            metaDepositAdjusted,
            address(token),
            metaStartTime,
            metaStopTime
        );
    }
}
