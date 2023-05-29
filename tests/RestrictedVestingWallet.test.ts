import "@nomiclabs/hardhat-waffle";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { RestrictedVestingWallet } from "typechain";
import { DM2P } from "typechain";
import { BigNumber } from "@ethersproject/bignumber";

describe("VestingWallet", function () {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let token: DM2P;
  let vestingWallet: RestrictedVestingWallet;

  const decimals = BigNumber.from(10).pow(18);
  const initialSupply = BigNumber.from(5).mul(1e9).mul(decimals);
  const capAmount = BigNumber.from(1e10).mul(decimals);

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    const Polyp = await ethers.getContractFactory("DM2P");
    token = (await Polyp.deploy()) as DM2P;
    await token.deployed();
  });

  describe("withdraw", function () {
    it("only beneficiary can withdraw", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.deployed();

      await token.mint(vestingWallet.address, initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration - 1,
      ]);
      await network.provider.send("evm_mine");

      await expect(
        vestingWallet.connect(other)["release(address)"](token.address)
      ).to.be.revertedWith("VestingWallet: caller is not the beneficiary");
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    it("beneficiary can withdraw acconding to vestingSchedule", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.deployed();

      await token.mint(vestingWallet.address, initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration / 2 - 1,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](token.address);
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply.div(2)
      );
      const block2 = await ethers.provider.getBlock("latest");

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration - 1,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](token.address);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("beneficiary cannot withdraw before start()", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime + 1000,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.deployed();

      await token.mint(vestingWallet.address, initialSupply);

      await vestingWallet["release(address)"](token.address);
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    it("beneficiary can withdraw after start() + duration()", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.deployed();

      await token.mint(vestingWallet.address, initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](token.address);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("duration is zero", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      const startTime = block.timestamp + 100;
      const duration = 0;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.deployed();

      await token.mint(vestingWallet.address, initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration - 1,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](token.address);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
      const block2 = await ethers.provider.getBlock("latest");
      expect(startTime).to.equal(block2.timestamp);
    });
  });
});
