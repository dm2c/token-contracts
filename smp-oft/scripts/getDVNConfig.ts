import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';
import 'dotenv/config';
import config from '../tasks/data/testnet_config.ts';


// the following value will be updated by the main function
let ethereumLzEndpointAddress = '';
let oappAddress = '';
let remoteEid; // Example target endpoint ID, 
let sendLibAddress = '';
let receiveLibAddress = '';

const executorConfigType = 1; // 1 for executor
const ulnConfigType = 2; // 2 for UlnConfig

async function getConfigAndDecode() {
  
  const contract = await ethers.getContractAt("IEndpointV2ForMessageLibManager", ethereumLzEndpointAddress);
  sendLibAddress = await contract.getSendLibrary(oappAddress, remoteEid);
  receiveLibAddress = (await contract.getReceiveLibrary(oappAddress, remoteEid))[0];
  // the output of getReceiveLibrary is 
  // [
  //   '0xdAf00F5eE2158dD58E0d3857851c432E34A3A851',
  //   true,
  //   lib: '0xdAf00F5eE2158dD58E0d3857851c432E34A3A851',
  //   isDefault: true
  // ]
  console.log("sendLibAddress: ", sendLibAddress);
  console.log("receiveLibAddress: ", receiveLibAddress);
  try {
    // Fetch and decode for sendLib (both Executor and ULN Config)
    const sendExecutorConfigBytes = await contract.getConfig(
      oappAddress,
      sendLibAddress,
      remoteEid,
      executorConfigType,
    );
    const executorConfigAbi = ['tuple(uint32 maxMessageSize, address executorAddress)'];
    const executorConfigArray = ethers.utils.defaultAbiCoder.decode(
      executorConfigAbi,
      sendExecutorConfigBytes,
    );
    console.log('Send Library Executor Config:', executorConfigArray);

    const sendUlnConfigBytes = await contract.getConfig(
      oappAddress,
      sendLibAddress,
      remoteEid,
      ulnConfigType,
    );
    const ulnConfigStructType = [
      'tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)',
    ];
    const sendUlnConfigArray = ethers.utils.defaultAbiCoder.decode(
      ulnConfigStructType,
      sendUlnConfigBytes,
    );
    console.log('Send Library ULN Config:', sendUlnConfigArray);

    // Fetch and decode for receiveLib (only ULN Config)
    const receiveUlnConfigBytes = await contract.getConfig(
      oappAddress,
      receiveLibAddress,
      remoteEid,
      ulnConfigType,
    );
    const receiveUlnConfigArray = ethers.utils.defaultAbiCoder.decode(
      ulnConfigStructType,
      receiveUlnConfigBytes,
    );
    console.log('Receive Library ULN Config:', receiveUlnConfigArray);
  } catch (error) {
    console.error('Error fetching or decoding config:', error);
  }
}
async function main(hre: HardhatRuntimeEnvironment) {
  let srcchain = hre.network.name;
  let dstchain = "dmm-verse-testnet";
  console.log(hre.network.name);
  
  if (config.networks[srcchain] === undefined || config.networks[dstchain] === undefined) {
    throw new Error("Invalid chain name");
  } else if (config.main == srcchain) {
      oappAddress = config.networks[srcchain].oftAdapter;
  } else {
      oappAddress = config.networks[srcchain].oft;
  }
  remoteEid = config.networks[dstchain].eid;
  ethereumLzEndpointAddress = config.networks[srcchain].endpointAddress;

  // Execute the function
  await getConfigAndDecode();

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
