import { ethers } from "hardhat";
import { DM2P } from "typechain";
import { LedgerSigner } from "@ethers-ext/signer-ledger";
import HIDTransport from "@ledgerhq/hw-transport-node-hid";

const main = async () => {
  let signer = new LedgerSigner(HIDTransport, ethers.provider);
  signer = signer.getSigner(process.env.HD_PATH);

  const DM2P = await ethers.getContractFactory("DM2P");
  const contract = (await DM2P.connect(signer).deploy()) as DM2P;
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
