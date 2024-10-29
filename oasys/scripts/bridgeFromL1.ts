import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import "dotenv/config";

async function bridgeFromL1() {
  const [deployer] = await ethers.getSigners();
  console.log(deployer.address);

  let l1bridgeAddress = process.env.L1_BRIDGE_ADDRESS;
  const L1Bridge = await ethers.getContractAt(
    "IL1StandardBridge",
    l1bridgeAddress
  );
  const L1Token = await ethers.getContractAt(
    "USDCMock",
    process.env.L1_TOKEN_ADDRESS
  );

  const amount = ethers.parseUnits("1", 6);
  console.log("L1 Token Balance:", await L1Token.balanceOf(deployer.address));

  const approveTx = await L1Token.approve(l1bridgeAddress, amount);
  console.log("Approving token tx: ", approveTx.hash);
  await approveTx.wait();
  console.log("Token approved at tx: ", approveTx.hash);

  const depositTx = await L1Bridge.depositERC20(
    process.env.L1_TOKEN_ADDRESS,
    process.env.L2_TOKEN_ADDRESS,
    amount,
    2000000,
    "0x"
  );
  console.log("Depositing token tx: ", depositTx.hash);
  await depositTx.wait();

  console.log("Token deposited at tx: ", depositTx.hash);
}
async function main(hre: HardhatRuntimeEnvironment) {
  console.log(hre.network.name);
  let srcchain = hre.network.name;

  // Execute the function
  await bridgeFromL1();
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
