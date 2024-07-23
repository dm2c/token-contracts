import { ethers } from "hardhat";
import { expect } from "chai";
import { DM2P, DM2P__factory, Minter, Minter__factory } from "typechain";
import { beforeEach } from "mocha";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EventLog } from "ethers";

describe("scenarios", async () => {
  let DM2P: DM2P__factory;
  let Minter: Minter__factory;
  let token: DM2P;
  let minter: Minter;
  let adminRole: string,
    minterRole: string,
    pauserRole: string,
    burnerRole: string;
  let owner: SignerWithAddress,
    beneficiary: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    carol: SignerWithAddress;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    beneficiary = signers[1];
    alice = signers[2];
    bob = signers[3];
    carol = signers[4];

    Minter = await ethers.getContractFactory("Minter");
    DM2P = await ethers.getContractFactory("DM2P");
    token = (await DM2P.deploy()) as DM2P;

    adminRole = await token.DEFAULT_ADMIN_ROLE();
    minterRole = await token.MINTER_ROLE();
    burnerRole = await token.BURNER_ROLE();
    pauserRole = await token.PAUSER_ROLE();
  });

  it("token deployment", async () => {
    const dm2p = (await DM2P.deploy()) as DM2P;
    expect(dm2p.hasRole(adminRole, owner.address));
    expect(dm2p.hasRole(minterRole, owner.address));
    expect(dm2p.hasRole(burnerRole, owner.address));
    expect(dm2p.hasRole(pauserRole, owner.address));

    await dm2p.grantRole(pauserRole, alice.address);
    expect(await dm2p.hasRole(pauserRole, alice.address)).to.be.true;

    await dm2p.grantRole(minterRole, bob.address);
    expect(await dm2p.hasRole(minterRole, bob.address)).to.be.true;

    await dm2p
      .connect(bob)
      .mint(owner.address, ((await dm2p.CAP_AMOUNT()) / 10n) * 2n);
    expect(await dm2p.balanceOf(owner.address)).to.equal(
      ((await dm2p.CAP_AMOUNT()) / 10n) * 2n
    );
  });

  describe("admin role", () => {
    beforeEach(async () => {
      await token.grantRole(adminRole, alice.address);
    });

    it("revoke and grant other roles", async () => {
      await token.connect(alice).grantRole(minterRole, bob.address);

      await token.connect(bob).mint(bob.address, 1);
      await expect(token.connect(bob).burn(1)).to.be.revertedWith(
        `AccessControl: account ${bob.address.toLowerCase()} is missing role ${burnerRole}`
      );

      await token.connect(alice).revokeRole(minterRole, bob.address);
      await expect(token.connect(bob).mint(bob.address, 1)).to.be.revertedWith(
        `AccessControl: account ${bob.address.toLowerCase()} is missing role ${minterRole}`
      );

      await token.connect(alice).grantRole(burnerRole, bob.address);
      await token.connect(bob).burn(1);
      await expect(token.connect(bob).mint(bob.address, 1)).to.be.revertedWith(
        `AccessControl: account ${bob.address.toLowerCase()} is missing role ${minterRole}`
      );
    });

    it("revoke initial admin role by new admin", async () => {
      await token.connect(alice).revokeRole(adminRole, owner.address);
      await expect(token.grantRole(adminRole, bob.address)).to.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("renounce", async () => {
      await token.renounceRole(adminRole, owner.address);
      await expect(token.grantRole(adminRole, bob.address)).to.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("last admin member can not renounce oneself", async () => {
      await token.connect(alice).revokeRole(adminRole, owner.address);
      await expect(token.grantRole(adminRole, bob.address)).to.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${adminRole}`
      );
      await expect(
        token.renounceRole(adminRole, owner.address)
      ).to.be.revertedWith("DM2P: each role must have at least 1 member");
    });
  });

  it("burn", async () => {
    await token.grantRole(burnerRole, bob.address);

    await token.mint(bob.address, 1);
    await token.mint(carol.address, 1);
    expect(await token.balanceOf(bob.address)).to.equal(1);
    expect(await token.totalSupply()).to.equal(2);

    await token.connect(bob).burn(1);

    expect(await token.balanceOf(bob.address)).to.equal(0);
    expect(await token.totalSupply()).to.equal(1);

    await token.connect(carol).approve(bob.address, 1);
    await token.connect(bob).burnFrom(carol.address, 1);
    expect(await token.balanceOf(carol.address)).to.equal(0);
    expect(await token.totalSupply()).to.equal(0);
  });

  it("pause and unpause", async () => {
    await token.grantRole(pauserRole, alice.address);
    await token.grantRole(burnerRole, bob.address);
    await token.mint(bob.address, 10);

    await token.connect(alice).pause();
    expect(await token.paused()).to.be.true;

    await expect(token.mint(bob.address, 10)).to.be.revertedWith(
      "ERC20Pausable: token transfer while paused"
    );
    await expect(
      token.connect(bob).transfer(carol.address, 5)
    ).to.be.revertedWith("ERC20Pausable: token transfer while paused");
    await expect(token.connect(bob).burn(5)).to.be.revertedWith(
      "ERC20Pausable: token transfer while paused"
    );

    await token.connect(alice).unpause();
    expect(await token.paused()).to.be.false;

    await token.mint(bob.address, 10);
    await token.connect(bob).transfer(carol.address, 5);
    await token.connect(bob).burn(5);
  });

  it("can unpause by another pauser", async () => {
    await token.grantRole(pauserRole, alice.address);
    await token.mint(bob.address, 10);

    await token.connect(alice).pause();
    expect(await token.paused()).to.be.true;

    await expect(
      token.connect(bob).transfer(carol.address, 5)
    ).to.be.revertedWith("ERC20Pausable: token transfer while paused");

    await token.revokeRole(pauserRole, alice.address);
    await token.grantRole(pauserRole, carol.address);
    await token.connect(carol).unpause();
    expect(await token.paused()).to.be.false;

    await token.connect(bob).transfer(carol.address, 5);

    await expect(token.connect(alice).pause()).to.be.revertedWith(
      `AccessControl: account ${alice.address.toLowerCase()} is missing role ${pauserRole}`
    );
  });

  it("can mint up to cap after burn", async () => {
    const dm2p = (await DM2P.deploy()) as DM2P;

    await dm2p.mint(owner.address, await dm2p.CAP_AMOUNT());
    expect(await dm2p.totalSupply()).to.equal(await dm2p.CAP_AMOUNT());
    expect(await dm2p.balanceOf(owner.address)).to.equal(
      await dm2p.CAP_AMOUNT()
    );
    await expect(dm2p.mint(owner.address, 1)).to.be.revertedWith(
      "ERC20Capped: cap exceeded"
    );

    await dm2p.burn(await dm2p.CAP_AMOUNT());
    expect(await dm2p.totalSupply()).to.equal(0);
    expect(await dm2p.balanceOf(owner.address)).to.equal(0);

    await dm2p.mint(owner.address, await dm2p.CAP_AMOUNT());
    expect(await dm2p.totalSupply()).to.equal(await dm2p.CAP_AMOUNT());
    expect(await dm2p.balanceOf(owner.address)).to.equal(
      await dm2p.CAP_AMOUNT()
    );
  });

  it("can mint up to cap when revoke assigned Minter contract", async () => {
    token = (await DM2P.deploy()) as DM2P;

    // deploy minter
    const block = await ethers.provider.getBlock("latest");
    const current = block.timestamp;
    minter = (await Minter.deploy(
      await token.getAddress(),
      ethers.parseEther("1"),
      current + 100,
      200,
      300,
      400
    )) as Minter;
    await token.grantRole(minterRole, await minter.getAddress());

    // mint token and lock tokens into vesting wallet
    let mintTimestamp = current + 100 + 200 / 2;
    await time.increaseTo(mintTimestamp);
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0.5"));
    let tx = await minter.mint(beneficiary.address, ethers.parseEther("0.5"));
    let receipt = await tx.wait();
    const events: EventLog[] = receipt?.logs;
    let vestingAddress: string = events?.[1].args?.[0];
    expect(await token.balanceOf(vestingAddress)).to.equal(
      ethers.parseEther("0.5")
    );

    // revoke minter role from minter
    await token.revokeRole(minterRole, await minter.getAddress());

    // it can not mint even remaining amount is unlocked
    await time.increaseTo(mintTimestamp + 100);
    expect(await minter.mintableAmount()).to.equal(ethers.parseEther("0.5"));
    await expect(
      minter.mint(beneficiary.address, ethers.parseEther("0.5"))
    ).to.be.revertedWith(
      `AccessControl: account ${(
        await minter.getAddress()
      ).toLowerCase()} is missing role ${minterRole}`
    );

    // other minter can mint up to cap
    const capAmount = await token.CAP_AMOUNT();
    await token.mint(
      owner.address,
      capAmount - (await token.balanceOf(vestingAddress))
    );
    expect(await token.totalSupply()).to.equal(capAmount);
  });
});
