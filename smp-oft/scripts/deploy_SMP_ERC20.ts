import { ethers } from "hardhat";

async function main() {
  

  const [deployer] = await ethers.getSigners();

  const smpContract = await ethers.deployContract("MyERC20Mock", ["Seamoon Protocol", "SMP"]);
  //const smpContract = await ethers.deployContract("MyERC20Mock", ["Mock Token", "TST"]);
  await smpContract.deployed();
  console.log("SMP deployed to:", smpContract.address);

  await smpContract.mint(deployer.address, ethers.utils.parseEther("1000000"));
  console.log("Minted to deployer: ", ethers.utils.formatEther(await smpContract.balanceOf(deployer.address)));

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});