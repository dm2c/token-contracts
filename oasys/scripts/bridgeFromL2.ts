import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import "dotenv/config";

async function bridgeFromL2() {
  const amount = ethers.parseUnits("1", 6);
  const [deployer] = await ethers.getSigners();
  let l2bridgeAddress = process.env.L2_BRIDGE_ADDRESS;
  const L2Bridge = await ethers.getContractAt(
    "IL2ERC20Bridge",
    l2bridgeAddress
  );
  const L2Token = await ethers.getContractAt(
    "L2StandardUSDC",
    process.env.L2_TOKEN_ADDRESS
  );
  console.log(
    "L2 Token Balance:",
    (await L2Token.balanceOf(deployer.address)).toString()
  );

  const approveTx = await L2Token.approve(l2bridgeAddress, amount, {
    gasLimit: 0x2fefd8, // to ignore provider error
  });
  console.log("Approving token tx: ", approveTx.hash);
  await approveTx.wait();
  console.log("Token approved at tx: ", approveTx.hash);

  const depositTx = await L2Bridge.withdraw(
    process.env.L2_TOKEN_ADDRESS,
    amount,
    2000000,
    "0x",
    {
      gasLimit: 0x2fefd8, // to ignore provider error
    }
  );
  console.log("Withdrawing token tx: ", depositTx.hash);
  await depositTx.wait();

  console.log("Token withdrawn at tx: ", depositTx.hash);
}
async function main(hre: HardhatRuntimeEnvironment) {
  console.log(hre.network.name);
  let srcchain = hre.network.name;

  // Execute the function
  await bridgeFromL2();
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
