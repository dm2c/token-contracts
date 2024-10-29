import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import "dotenv/config";

async function main(hre: HardhatRuntimeEnvironment) {
  const [deployer] = await ethers.getSigners();

  const USDCL1Contract = await ethers.getContractFactory("USDCMock");
  const usdcL1 = await USDCL1Contract.deploy(
    deployer.address,
    "Mock USDC",
    "USDC"
  );
  console.log("USDC L1 deployed to:", usdcL1.target);
  await usdcL1.deploymentTransaction()?.wait();

  const mintTx = await usdcL1["mint(address,uint256)"](
    deployer.address,
    ethers.parseUnits("10000", 6)
  ); //mint 10000 USDC
  await mintTx.wait();

  console.log(
    "balance of usdcL1",
    (await usdcL1.balanceOf(deployer.address)).toString()
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
