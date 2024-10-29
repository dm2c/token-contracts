import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import "dotenv/config";
//dotenv.config();

async function main(hre: HardhatRuntimeEnvironment) {
  console.log(hre.network.name);
  let [deployer] = await ethers.getSigners();

  if (hre.network.name === "dm2" || hre.network.name === "dm2test") {
    await hre.run("verify:verify", {
      address: process.env.L2_TOKEN_ADDRESS,
      constructorArguments: [
        process.env.L2_TOKEN_ADDRESS,
        process.env.L2_BRIDGE_ADDRESS,
        "Bridged USDC (Celer)",
        "USDC.e",
      ],
      contract: "contracts/L2/token/L2StandardUSDC.sol:L2StandardUSDC",
    });
  } else if (hre.network.name === "oasys_test") {
    await hre.run("verify:verify", {
      address: process.env.L1_TOKEN_ADDRESS,
      constructorArguments: [deployer.address, "Mock USDC", "USDC"],
      contract: "contracts/L1/token/USDCMock.sol:USDCMock",
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
