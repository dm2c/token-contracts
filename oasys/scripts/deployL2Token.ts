import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import "dotenv/config";

async function deployL2Token() {
  const [deployer] = await ethers.getSigners();
  let l1tokenAddress = process.env.L1_TOKEN_ADDRESS;
  let bridgeAddress = process.env.L2_BRIDGE_ADDRESS;
  console.log("L1 Token Address:", l1tokenAddress);

  if (!l1tokenAddress || !bridgeAddress) {
    throw new Error(
      "L1_TOKEN_ADDRESS or L2_BRIDGE_ADDRESS is not defined in the environment variables."
    );
  }

  const USDCL2Contract = await ethers.getContractFactory("L2StandardUSDC");
  const usdcL2 = await USDCL2Contract.deploy(
    bridgeAddress,
    l1tokenAddress,
    "Bridged USDC (Celer)",
    "USDC.e",
    {
      gasLimit: 0x2fefd8, // to ignore provider error
    }
  );
  console.log("USDC L2 deployed to:", usdcL2.target);
}
async function main(hre: HardhatRuntimeEnvironment) {
  console.log(hre.network.name);
  let srcchain = hre.network.name;

  // Execute the function
  await deployL2Token();
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
