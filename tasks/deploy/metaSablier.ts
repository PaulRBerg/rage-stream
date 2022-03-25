import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { MetaSablier } from "../../src/types/contracts/MetaStream.sol/MetaSablier";
import { Sablier } from "../../src/types/contracts/sablier/Sablier";
import { MetaSablier__factory } from "../../src/types/factories/contracts/MetaStream.sol/MetaSablier__factory";
import { Sablier__factory } from "../../src/types/factories/contracts/sablier/Sablier__factory";

task("deploy:MetaSablier")
  .addParam("development", "Whether to deploy the Sablier contract", false, types.boolean)
  .addParam("sablier", "Address of Sablier contract", false, types.string)
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    let sablierAddress;

    if (taskArguments.development) {
      const sablierFactory: Sablier__factory = <Sablier__factory>await ethers.getContractFactory("Sablier");
      const sablier: Sablier = <Sablier>await sablierFactory.deploy();
      sablierAddress = sablier.address;
    } else {
      if (taskArguments.sablier) {
        throw new Error("Sablier address not provided");
      }
      sablierAddress = taskArguments.sablier;
    }

    const signers: SignerWithAddress[] = await ethers.getSigners();
    const metaSablierFactory: MetaSablier__factory = <MetaSablier__factory>(
      await ethers.getContractFactory("MetaSablier")
    );
    const metaSablier: MetaSablier = <MetaSablier>await metaSablierFactory.deploy(signers[0].address, sablierAddress);
    await metaSablier.deployed();
    console.log("MetaSablier deployed to: ", metaSablier.address);
  });
