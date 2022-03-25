import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256 } from "@ethersproject/constants";
import { expect } from "chai";
import dayjs from "dayjs";

import { STREAM_DEPOSIT, TIME_DELTA, TIME_OFFSET } from "../../shared/constants";

export function shouldBehaveLikeCreateStream(): void {
  const now: BigNumber = BigNumber.from(dayjs().unix());
  const startTime: BigNumber = now.add(TIME_OFFSET);
  const stopTime: BigNumber = startTime.add(TIME_DELTA);

  beforeEach(async function () {
    await this.contracts.token.connect(this.signers.sender).approve(this.contracts.metaSablier.address, MaxUint256);
  });

  context("when it is not the first time that the meta stream is created", function () {
    it("reverts", async function () {
      await this.contracts.metaSablier
        .connect(this.signers.sender)
        .createStream(
          this.signers.recipient.address,
          STREAM_DEPOSIT,
          this.contracts.token.address,
          startTime,
          stopTime,
        );
      await expect(
        this.contracts.metaSablier
          .connect(this.signers.sender)
          .createStream(
            this.signers.recipient.address,
            STREAM_DEPOSIT,
            this.contracts.token.address,
            startTime,
            stopTime,
          ),
      ).to.be.revertedWith("only one meta stream can be created");
    });
  });

  // context("when it is the first time that the meta stream is created", function() {
  // // TODO
  // });
}
