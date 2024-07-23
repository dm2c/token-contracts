import { ethers } from "hardhat";
import { expect } from "chai";
import {
  DM2P,
  Minter,
  Minter__factory,
  RestrictedVestingWallet,
  RestrictedVestingWallet__factory,
} from "typechain";
import { beforeEach } from "mocha";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Log, EventLog } from "ethers";

let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let beneficiary: SignerWithAddress;
let initialOwnerBalance: bigint;

const decimals: bigint = 10n ** 18n;
const initialSupply: bigint = 5n * 10n ** 9n * decimals;

const MOCK_CAP_AMOUNT = ethers.parseEther("1");
const MOCK_MINT_START = 100;
const MOCK_MINTING_DURATION = 200;
const MOCK_LOCKING_DURATION = 300;
const MOCK_VESTING_DURATION = 400;

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

describe("testing for Minter", async () => {
  let Minter: Minter__factory;
  let VestingWallet: RestrictedVestingWallet__factory;
  let token: DM2P;
  let minter: Minter;
  let current: number;
  let events: EventLog[] | undefined;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];
    addr2 = signers[2];
    beneficiary = signers[3];

    Minter = (await ethers.getContractFactory("Minter")) as Minter__factory;
    VestingWallet = (await ethers.getContractFactory(
      "VestingWallet"
    )) as RestrictedVestingWallet__factory;
    const DM2P = await ethers.getContractFactory("DM2P");
    token = await DM2P.deploy();
    await token.mint(owner.address, initialSupply);

    initialOwnerBalance = await token.balanceOf(owner.address);

    const block = await ethers.provider.getBlock("latest");
    current = block.timestamp;
    minter = (await Minter.deploy(
      await token.getAddress(),
      MOCK_CAP_AMOUNT,
      current + MOCK_MINT_START,
      MOCK_MINTING_DURATION,
      MOCK_LOCKING_DURATION,
      MOCK_VESTING_DURATION
    )) as Minter;
    await token.grantRole(MINTER_ROLE, await minter.getAddress());
  });

  describe("constructor", () => {
    describe("success", () => {
      it("set token address", async () => {
        expect(await minter.erc20()).to.equal(await token.getAddress());
      });

      it("set capAmount state", async () => {
        expect(await minter.capAmount()).to.equal(MOCK_CAP_AMOUNT);
      });

      it("set mintStart state", async () => {
        expect(await minter.mintStart()).to.equal(current + MOCK_MINT_START);
      });
      it("set mintingDuration state", async () => {
        expect(await minter.mintingDuration()).to.equal(200);
      });
      it("set lockingDuration state", async () => {
        expect(await minter.lockingDuration()).to.equal(300);
      });
      it("set vestingDuration state", async () => {
        expect(await minter.vestingDuration()).to.equal(400);
      });

      // TODO unstable gas cost for coverage test
      xit("gas cost", async () => {
        current = Date.now();
        const minter = await Minter.deploy(
          await token.getAddress(),
          MOCK_CAP_AMOUNT,
          current,
          100,
          200,
          0
        );
        const tx = await minter.deploymentTransaction();
        const receipt = await tx?.wait();
        expect(receipt?.gasUsed).to.be.equal(1326390);
      });

      it("even if vestingDuration is zero, it does not throw an error", async () => {
        current = Date.now();
        await expect(
          Minter.deploy(
            await token.getAddress(),
            MOCK_CAP_AMOUNT,
            current,
            100,
            200,
            0
          )
        ).not.to.be.reverted;
      });
    });

    describe("errors", () => {
      it("if token address is zero, it throws an error", async () => {
        await expect(
          Minter.deploy(ethers.ZeroAddress, 100, 100, 100, 100, 100)
        ).to.be.revertedWith("Minter: zero address");
      });

      it("if capAmount is zero, it throws an error", async () => {
        await expect(
          Minter.deploy(await token.getAddress(), 0, 100, 100, 100, 100)
        ).to.be.revertedWith("Minter: cap amount is zero");
      });

      it("if mintStart is zero, it throws an error", async () => {
        await expect(
          Minter.deploy(await token.getAddress(), 100, 0, 100, 100, 100)
        ).to.be.revertedWith("Minter: mint start is zero");
      });
    });
  });

  describe("mint", () => {
    describe("success", () => {
      let vestingAddress: string;
      let vestingWallet: RestrictedVestingWallet;

      beforeEach(async () => {
        expect(await minter.mintableAmount()).to.equal(0);
        await time.increaseTo(
          current + MOCK_MINT_START + MOCK_MINTING_DURATION
        );
        expect(await minter.mintableAmount()).to.equal(MOCK_CAP_AMOUNT);
        const tx = await minter.mint(beneficiary.address, MOCK_CAP_AMOUNT);
        const receipt = await tx.wait();
        events = receipt?.logs;

        vestingAddress = events?.[1].args?.[0];
        vestingWallet = VestingWallet.attach(vestingAddress);
      });

      it("emits Mint event", async () => {
        expect(events?.length).to.equal(2);
        expect(events?.[1].address).to.equal(await minter.getAddress());
        expect(events?.[1].eventSignature).to.equal("Mint(address,uint256)");
      });

      it("deploy new vesting wallet", async () => {
        expect(await vestingWallet.beneficiary()).to.equal(beneficiary.address);
      });

      it("mint tokens to vesting wallet", async () => {
        expect(
          await token.balanceOf(await vestingWallet.getAddress())
        ).to.equal(MOCK_CAP_AMOUNT);
      });

      it("beneficiary of new vesting wallet is equal to given arg", async () => {
        expect(await vestingWallet.beneficiary()).to.equal(beneficiary.address);
      });

      it("start timestamp of new vesting wallet is equal to current time + locking duration", async () => {
        const block = await ethers.provider.getBlock("latest");
        expect(await vestingWallet.start()).to.equal(
          block.timestamp + MOCK_LOCKING_DURATION
        );
      });

      it("if time is after mintStart, it can mint tokens", async () => {
        const block = await ethers.provider.getBlock("latest");
        current = block.timestamp;
        minter = (await Minter.deploy(
          await token.getAddress(),
          MOCK_CAP_AMOUNT,
          current + MOCK_MINT_START,
          MOCK_MINTING_DURATION,
          MOCK_LOCKING_DURATION,
          MOCK_VESTING_DURATION
        )) as Minter;
        await token.grantRole(MINTER_ROLE, await minter.getAddress());

        expect(await minter.mintableAmount()).to.equal(0);

        // 0% is mintable
        await time.increaseTo(current + 100);
        expect(await minter.mintableAmount()).to.equal(0);

        // 1% is mintable
        await time.increaseTo(current + 102);
        expect(await minter.mintableAmount()).to.equal(
          ethers.parseEther("0.01")
        );

        // 10% is mintable
        await time.increaseTo(current + 120);
        expect(await minter.mintableAmount()).to.equal(
          ethers.parseEther("0.1")
        );

        // 50% is mintable
        await time.increaseTo(current + 200);
        expect(await minter.mintableAmount()).to.equal(
          ethers.parseEther("0.5")
        );

        // 100% is mintable
        await time.increaseTo(current + 300);
        expect(await minter.mintableAmount()).to.equal(ethers.parseEther("1"));
      });

      it("if minting duration is passed, all token is mintable", async () => {
        const block = await ethers.provider.getBlock("latest");
        current = block.timestamp;
        minter = (await Minter.deploy(
          await token.getAddress(),
          MOCK_CAP_AMOUNT,
          current + MOCK_MINT_START,
          MOCK_MINTING_DURATION,
          MOCK_LOCKING_DURATION,
          MOCK_VESTING_DURATION
        )) as Minter;
        await token.grantRole(MINTER_ROLE, await minter.getAddress());

        expect(await minter.mintableAmount()).to.equal(0);
        await time.increaseTo(current + 400);
        expect(await minter.mintableAmount()).to.equal(MOCK_CAP_AMOUNT);
      });
    });

    describe("error", () => {
      it("only owner can mint", async () => {
        await time.increaseTo(
          current + MOCK_MINT_START + MOCK_MINTING_DURATION
        );
        await expect(
          minter.connect(addr1).mint(beneficiary.address, MOCK_CAP_AMOUNT)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("if mintStart is future, it throws an error", async () => {
        const block = await ethers.provider.getBlock("latest");
        minter = (await Minter.deploy(
          await token.getAddress(),
          MOCK_CAP_AMOUNT,
          block.timestamp + 1000,
          block.timestamp + 1000,
          block.timestamp + 1000,
          block.timestamp + 1000
        )) as Minter;
        await token.grantRole(MINTER_ROLE, await minter.getAddress());
        await expect(minter.mint(beneficiary.address, 100)).to.be.revertedWith(
          "Minter: mint is not started"
        );
      });

      it("if beneficiary is zero, it throws an error", async () => {
        await expect(minter.mint(ethers.ZeroAddress, 100)).to.be.revertedWith(
          "Minter: zero address"
        );
      });

      it("if amount is zero, it throws an error", async () => {
        await expect(minter.mint(beneficiary.address, 0)).to.be.revertedWith(
          "Minter: amount is zero"
        );
      });

      it("if minting amount is greater than mintable amount, it throws an error on first minting", async () => {
        await time.increaseTo(
          current + MOCK_MINT_START + MOCK_MINTING_DURATION
        );
        await expect(
          minter.mint(beneficiary.address, MOCK_CAP_AMOUNT + 1n)
        ).to.be.revertedWith("Minter: minting amount is greater than mintable");
      });

      it("if minting amount is greater than minted + mintable amount, it throws an error", async () => {
        await time.increaseTo(
          current + MOCK_MINT_START + MOCK_MINTING_DURATION
        );
        await minter.mint(beneficiary.address, MOCK_CAP_AMOUNT / 2n);
        await expect(
          minter.mint(beneficiary.address, MOCK_CAP_AMOUNT / 2n + 1n)
        ).to.be.revertedWith("Minter: minting amount is greater than mintable");
      });

      it("if minted amount is equal to capAmount, it throws an error", async () => {
        await time.increaseTo(
          current + MOCK_MINT_START + MOCK_MINTING_DURATION
        );
        await minter.mint(beneficiary.address, MOCK_CAP_AMOUNT);
        await expect(minter.mint(beneficiary.address, 1)).to.be.revertedWith(
          "Minter: minting amount is greater than mintable"
        );
      });
    });
  });

  it("scenario", async () => {
    // deploy token
    const DM2P = await ethers.getContractFactory("DM2P");
    token = (await DM2P.deploy()) as DM2P;
    await token.mint(owner.address, initialSupply);
    initialOwnerBalance = await token.balanceOf(owner.address);

    // deploy minter
    const block = await ethers.provider.getBlock("latest");
    current = block.timestamp;
    minter = await Minter.deploy(
      await token.getAddress(),
      MOCK_CAP_AMOUNT,
      current + MOCK_MINT_START,
      MOCK_MINTING_DURATION,
      MOCK_LOCKING_DURATION,
      MOCK_VESTING_DURATION
    );
    await token.grantRole(MINTER_ROLE, await minter.getAddress());

    // mint token and lock tokens into vesting wallet
    let mintTimestamp = current + MOCK_MINT_START + MOCK_MINTING_DURATION / 2;
    await time.increaseTo(mintTimestamp);
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0.5"));
    let tx = await minter.mint(beneficiary.address, ethers.parseEther("0.5"));
    let receipt = await tx.wait();
    events = receipt?.logs;
    let vestingAddress1: string = events?.[1].args?.[0];
    let vestingWallet1: RestrictedVestingWallet = await VestingWallet.attach(
      vestingAddress1
    );
    expect(await token.balanceOf(await vestingWallet1.getAddress())).to.equal(
      ethers.parseEther("0.5")
    );

    // mint again and lock tokens with newly deployed vesting wallet
    await time.increaseTo(mintTimestamp + 50);
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0.25"));
    tx = await minter.mint(beneficiary.address, ethers.parseEther("0.25"));
    receipt = await tx.wait();
    events = receipt?.logs;
    let vestingAddress2: string = events?.[1].args?.[0];
    let vestingWallet2: RestrictedVestingWallet = await VestingWallet.attach(
      vestingAddress2
    );
    expect(vestingAddress1.toLowerCase()).to.not.equal(
      vestingAddress2.toLowerCase()
    );
    expect(await token.balanceOf(await vestingWallet2.getAddress())).to.equal(
      ethers.parseEther("0.25")
    );

    // mint tokens up to minter cap amount
    await time.increaseTo(mintTimestamp + 100);
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0.25"));
    tx = await minter.mint(beneficiary.address, ethers.parseEther("0.25"));
    receipt = await tx.wait();
    events = receipt?.logs;
    let vestingAddress3: string = events?.[1].args?.[0];
    let vestingWallet3: RestrictedVestingWallet = await VestingWallet.attach(
      vestingAddress3
    );
    expect(vestingAddress2.toLowerCase()).to.not.equal(
      vestingAddress3.toLowerCase()
    );
    expect(await token.balanceOf(await vestingWallet3.getAddress())).to.equal(
      ethers.parseEther("0.25")
    );
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0"));

    // no tokens are releasable yet
    tx = await vestingWallet1
      .connect(beneficiary)
      ["release(address)"](await token.getAddress());
    receipt = await tx.wait();
    events = receipt?.logs;
    let releasedEvent = events?.[0]!!;
    expect(releasedEvent.eventSignature).to.equal(
      "ERC20Released(address,uint256)"
    );
    expect(releasedEvent.args?.[0]).to.equal(await token.getAddress());
    expect(releasedEvent.args?.[1]).to.equal(0);

    // release from vesting wallet
    await time.increaseTo(mintTimestamp + MOCK_LOCKING_DURATION + 100);
    tx = await vestingWallet1
      .connect(beneficiary)
      ["release(address)"](await token.getAddress());
    receipt = await tx.wait();
    events = receipt?.logs;
    releasedEvent = events?.[0]!!;
    expect(releasedEvent.eventSignature).to.equal(
      "ERC20Released(address,uint256)"
    );
    expect(releasedEvent.args?.[0]).to.equal(await token.getAddress());
    expect(releasedEvent.args?.[1]).to.equal(ethers.parseEther("0.125"));
    expect(await token.balanceOf(beneficiary.address)).to.equal(
      "125000000000000000"
    );

    // release
    await time.increaseTo(
      mintTimestamp + MOCK_LOCKING_DURATION + MOCK_VESTING_DURATION
    );
    tx = await vestingWallet1
      .connect(beneficiary)
      ["release(address)"](await token.getAddress());
    receipt = await tx.wait();
    events = receipt?.logs;
    releasedEvent = events?.[0]!!;
    expect(releasedEvent.eventSignature).to.equal(
      "ERC20Released(address,uint256)"
    );
    expect(releasedEvent.args?.[0]).to.equal(await token.getAddress());
    expect(releasedEvent.args?.[1]).to.equal(ethers.parseEther("0.375"));
    expect(await token.balanceOf(beneficiary.address)).to.equal(
      "500000000000000000"
    );

    // mint is unavailable tokens up to minter cap amount even if time is passed
    await time.increaseTo(mintTimestamp + 1000);
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0"));
    await expect(minter.mint(beneficiary.address, 1)).to.be.revertedWith(
      "Minter: minting amount is greater than mintable"
    );
  });
});
