import { ethers, network } from "hardhat";
import { assert, expect } from "chai";
import { RestrictedVestingWallet } from "typechain";
import { DM2P } from "typechain";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VestingWallet", function () {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let token: DM2P;
  let vestingWallet: RestrictedVestingWallet;

  const decimals = 10n ** 18n;
  const initialSupply = 5n * 10n ** 9n * decimals;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    const DM2P = await ethers.getContractFactory("DM2P");
    token = await DM2P.deploy();
    await token.waitForDeployment();
  });

  describe("release for ETH", () => {
    beforeEach(async () => {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      assert(block !== null);
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;

      await vestingWallet.waitForDeployment();
    });

    it("only beneficiary can withdraw", async () => {
      await vestingWallet["release()"]();
    });

    it("non beneficiary can not withdraw", async () => {
      await expect(
        vestingWallet.connect(other)["release()"]()
      ).to.be.revertedWith(
        "RestrictedVestingWallet: caller is not the beneficiary"
      );
    });
  });

  describe("withdraw", function () {
    it("only beneficiary can withdraw", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      assert(block !== null);
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.waitForDeployment();

      await token.mint(await vestingWallet.getAddress(), initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration - 1,
      ]);
      await network.provider.send("evm_mine");

      await expect(
        vestingWallet
          .connect(other)
          ["release(address)"](await token.getAddress())
      ).to.be.revertedWith(
        "RestrictedVestingWallet: caller is not the beneficiary"
      );
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    it("beneficiary can withdraw acconding to vestingSchedule", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      assert(block !== null);
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.waitForDeployment();

      await token.mint(await vestingWallet.getAddress(), initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration / 2 - 1,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](await token.getAddress());
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply / 2n);
      const block2 = await ethers.provider.getBlock("latest");

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration - 1,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](await token.getAddress());
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("beneficiary cannot withdraw before start()", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      assert(block !== null);
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime + 1000,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.waitForDeployment();

      await token.mint(await vestingWallet.getAddress(), initialSupply);

      await vestingWallet["release(address)"](await token.getAddress());
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    it("beneficiary can withdraw after start() + duration()", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      assert(block !== null);
      const startTime = block.timestamp;
      const duration = 1000;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.waitForDeployment();

      await token.mint(await vestingWallet.getAddress(), initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](await token.getAddress());
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("duration is zero", async function () {
      const VestingWallet = await ethers.getContractFactory(
        "RestrictedVestingWallet"
      );
      const block = await ethers.provider.getBlock("latest");
      assert(block !== null);
      const startTime = block.timestamp + 100;
      const duration = 0;

      vestingWallet = (await VestingWallet.deploy(
        owner.address,
        startTime,
        duration
      )) as RestrictedVestingWallet;
      await vestingWallet.waitForDeployment();

      await token.mint(await vestingWallet.getAddress(), initialSupply);

      await network.provider.send("evm_setNextBlockTimestamp", [
        startTime + duration - 1,
      ]);
      await network.provider.send("evm_mine", []);

      await vestingWallet["release(address)"](await token.getAddress());
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
      const block2 = await ethers.provider.getBlock("latest");
      assert(block2 !== null);
      expect(startTime).to.equal(block2.timestamp);
    });
  });
});
