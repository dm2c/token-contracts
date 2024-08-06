import { ethers } from "hardhat";
import { SeamoonProtocol } from "typechain";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const SMP = await ethers.getContractFactory("SeamoonProtocol");

  const contract = (await SMP.connect(deployer).deploy()) as SeamoonProtocol;
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
