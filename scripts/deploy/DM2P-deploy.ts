import { ethers } from "hardhat";
import { DM2P } from "typechain";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const DM2P = await ethers.getContractFactory("DM2P");

  const contract = (await DM2P.connect(deployer).deploy()) as DM2P;
  await contract.waitForDeployment();

  console.log("deployed txHash:", contract.deploymentTransaction()?.hash);
  console.log("deployed address:", await contract.getAddress());
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
