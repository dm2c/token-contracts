import "@nomiclabs/hardhat-waffle"
import { ethers } from 'hardhat'
import { expect, use } from 'chai'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { DM2P } from "typechain"
import { BigNumber } from "@ethersproject/bignumber";

let owner: SignerWithAddress
let addr1: SignerWithAddress
let addr2: SignerWithAddress
let initialOwnerBalance: BigNumber

const decimals = BigNumber.from(10).pow(18);
const initialSupply = BigNumber.from(5 * 1e9).mul(decimals);
const capAmount = BigNumber.from(1e10).mul(decimals);

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a"
const BURNER_ROLE = "0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848"

describe("testing for DM2P", async () => {
    let contract: DM2P

    beforeEach(async () => {
        const signers = await ethers.getSigners()
        owner = signers[0]
        addr1 = signers[1]
        addr2 = signers[2]

        const DM2P = await ethers.getContractFactory("DM2P");
        contract = (await DM2P.deploy()) as DM2P

        await contract.mint(owner.address, initialSupply)

        initialOwnerBalance = await contract.balanceOf(owner.address)
    })

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await contract.balanceOf(owner.address);
      expect(await contract.totalSupply()).to.equal(ownerBalance);
    });
  });


  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {

      await contract.transfer(addr1.address, 50);
      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await contract.connect(addr1).transfer(addr2.address, 50);
      const addr1Balance_after = await contract.balanceOf(addr1.address);
      const addr2Balance = await contract.balanceOf(addr2.address);
      expect(addr1Balance_after).to.equal(0);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {

      await expect(
        contract.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await contract.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      await contract.transfer(addr1.address, 100);
      await contract.transfer(addr2.address, 50);

      const owner1Balance = await contract.balanceOf(owner.address);
      expect(owner1Balance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await contract.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });


  describe("Mint", async function () {
    // 最初のサプライ
    it("Should mint initial supplies correctly", async function () {
      expect(initialOwnerBalance).to.equal(initialSupply);
    });

    // capの量
    it("Shoud set cap correctly", async function () {
      expect(await contract.cap()).to.equal(capAmount);
    });

    // // 管理者によるミント
    it("Should allow admin to mint", async function () {
      await contract.connect(owner).mint(owner.address, 50);
      expect(
        await contract.balanceOf(owner.address)
      ).to.equal(initialOwnerBalance.add(50));
    });

    // // 管理者以外によるミント
    it("Should fail to mint when users other than admin signs", async function () {
      expect(
        contract.connect(addr1).mint(owner.address, 50)
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${MINTER_ROLE}`);
    });

    // キャップを超えたミント
    it("Should fail when exceeds the cap", async function () {
      expect(
        contract.connect(owner).mint(owner.address, capAmount.add(50))
      ).to.be.revertedWith('ERC20Capped: cap exceeded');
    });
  });


  describe("pause", async function () {
    // 管理者によるpause, unpause
    it("Should allow admin to paused and unpaused", async function () {
      //pause
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.equal(true);

      // pause中のtransfer
      expect(
        contract.transfer(addr1.address, 100)
      ).to.be.revertedWith('ERC20Pausable: token transfer while paused');

      //unpause
      await contract.connect(owner).unpause();
      expect(await contract.paused()).to.equal(false);

      // unpause後のtransfer
      await contract.transfer(addr1.address, 50);
      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    // 管理者以外のpause
    it("Should fail when pause by non-admin", async function () {
      expect(
        contract.connect(addr1).pause()
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${PAUSER_ROLE}`);
    });
  });

  describe("burn", async function () {
    // 管理者によるburn
    it("Should allow burn by admin", async function () {
      await contract.connect(owner).burn(50);
      expect(
        await contract.balanceOf(owner.address)
      ).to.equal(initialOwnerBalance.sub(50));
      expect(await contract.totalSupply()).to.equal(initialSupply.sub(50));
    });

    // 管理者以外によるburn
    it("Should fail when burn by non-admin", async function () {
      expect(
        contract.connect(addr1).burn(50)
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${BURNER_ROLE}`);
    });

    // 管理者によるburnFrom
    it("Should allow burnFrom by admin", async function () {
      await contract.connect(owner).mint(addr1.address, 100);
      await contract.connect(addr1).approve(owner.address, 50);

      await contract.connect(owner).burnFrom(addr1.address,50);
      expect(
        await contract.balanceOf(addr1.address)
      ).to.equal(50);
      expect(await contract.totalSupply()).to.equal(initialSupply.add(50));
    });

    // 管理者以外によるburnFrom
    it("Should fail when burnFrom by non-admin", async function () {
      await contract.connect(owner).mint(addr1.address, 100);
      await contract.connect(addr1).approve(addr2.address, 50);

      expect(
        contract.connect(addr2).burnFrom(addr1.address,50)
      ).to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${BURNER_ROLE}`);
    });

    // approveを超えるburnFrom
    it("Should fail when exceeds the approve", async function () {
      await contract.connect(owner).mint(addr1.address, 100);
      await contract.connect(addr1).approve(owner.address, 50);

      expect(
        contract.connect(owner).burnFrom(addr1.address,100)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("AccessControl", async function () {
    // 初期の DEFAULT_ADMIN_ROLE の確認
    it("Should grant initial DEFAULT_ADMIN_ROLE correctly", async function () {
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, addr1.address)).to.equal(false);
    });

    // 権限の付与
    it("Should allow admin to grant role", async function () {
      expect(await contract.hasRole(MINTER_ROLE, addr1.address)).to.equal(false);

      //権限付与
      await contract.connect(owner).grantRole(MINTER_ROLE, addr1.address);
      expect(await contract.hasRole(MINTER_ROLE, addr1.address)).to.equal(true);

      //mint
      await contract.connect(addr1).mint(addr2.address, 50);
      expect(
        await contract.balanceOf(addr2.address)
      ).to.equal(50);
    });

    // 管理者以外の権限付与
    it("Should fail when grant role by non-admin", async function () {
      expect(
        contract.connect(addr1).grantRole(MINTER_ROLE, addr2.address)
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`);
    });

    // 権限の解除
    it("Should allow admin to revoke role", async function () {
      await contract.connect(owner).grantRole(MINTER_ROLE, addr1.address);
      expect(await contract.hasRole(MINTER_ROLE, addr1.address)).to.equal(true);

      //権限解除
      await contract.connect(owner).revokeRole(MINTER_ROLE, addr1.address);
      expect(await contract.hasRole(MINTER_ROLE, addr1.address)).to.equal(false);

      //mint
      expect(
        contract.connect(addr1).mint(owner.address, 50)
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${MINTER_ROLE}`);
    });

    // 管理者の付与
    it("Should allow admin to revoke role", async function () {
      await contract.connect(owner).grantRole(DEFAULT_ADMIN_ROLE, addr1.address);
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, addr1.address)).to.equal(true);

      //初期管理者以外による権限付与
      await contract.connect(addr1).grantRole(MINTER_ROLE, addr2.address)
      expect(await contract.hasRole(MINTER_ROLE, addr2.address)).to.equal(true);

      //管理権限剥奪後の権限付与
      await contract.connect(owner).revokeRole(DEFAULT_ADMIN_ROLE, addr1.address);
      expect(
        contract.connect(addr1).grantRole(MINTER_ROLE, addr1.address)
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`);
    });
  });
});