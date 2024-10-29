import 'dotenv/config';
import { task, types } from 'hardhat/config';
import config from './data/testnet_config';
import { Contract } from "ethers";

//if we import ethers from hardhat, the error will happen
//import { ethers } from "hardhat";

async function updateSendLibrary(sendLibAddress: string, oAppAddress: string, remoteEid: string, endpointContract: Contract) {

  try {
    // Set the send library
    const sendTx = await endpointContract.setSendLibrary(
      oAppAddress,
      remoteEid,
      sendLibAddress, 
    );
    console.log('Send library transaction sent:', sendTx.hash);
    await sendTx.wait();
    console.log('Send library set successfully.');

  } catch (error) {
    console.error('Transaction failed:', error);
  }
}


task('blockSend', 'block send to another chain by updating the send library')
    .addParam('srcchain', 'source chain', '', types.string) 
    .addParam('dstchain', 'destination chain', '', types.string) 
    .addParam('isblock', 'block or unblock', '', types.boolean)
    .setAction(async function (args, { ethers }) {
        const { srcchain, dstchain, isblock } = args;
        let oAppAddress;
        let sendLibAddress;
        const AddressZero = ethers.constants.AddressZero;

        if (config.networks[srcchain] === undefined || config.networks[dstchain] === undefined) {
            throw new Error("Invalid chain name");
        } else if (config.main == srcchain) {
            oAppAddress = config.networks[srcchain].oftAdapter;
        } else {
            oAppAddress = config.networks[srcchain].oft;
        }

        let endpointAddress = config.networks[srcchain].endpointAddress;
        const endpointContract = await ethers.getContractAt("IEndpointV2ForMessageLibManager", endpointAddress);

        if(isblock) {
          console.log("Blocking send to ", dstchain);
          sendLibAddress = await endpointContract.blockedLibrary();
        } else {
          sendLibAddress = AddressZero;//if address is zero, endpoint will use the default library
        }
        const remoteEid = config.networks[dstchain].eid;

        await updateSendLibrary(sendLibAddress, oAppAddress, remoteEid, endpointContract);

    })
