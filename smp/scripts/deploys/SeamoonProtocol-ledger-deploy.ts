import { ethers } from "hardhat";
import { SeamoonProtocol } from "typechain";
import { LedgerSigner } from "@ethers-ext/signer-ledger";
import HIDTransport from "@ledgerhq/hw-transport-node-hid";

const main = async () => {
  let signer = new LedgerSigner(HIDTransport, ethers.provider);
  signer = signer.getSigner(process.env.HD_PATH);

  const SMP = await ethers.getContractFactory("SeamoonProtocol");
  const contract = (await SMP.connect(signer).deploy()) as SeamoonProtocol;
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
