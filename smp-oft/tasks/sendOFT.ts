import { task, types } from 'hardhat/config';
//import { ethers } from "hardhat";
import { Options } from '@layerzerolabs/lz-v2-utilities'
import config from './data/mainnet_config';

async function sendFromL1toL2(srcChain: string, dstChain: string, receiver: string, tokensToSend: bigint, ethers: any) { 

    // Defining extra message execution options for the send operation
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

    const sendParam = [
        config.networks[dstChain].eid,
        ethers.utils.zeroPad(receiver, 32),
        tokensToSend,
        tokensToSend,
        options,
        '0x',
        '0x',
    ]
    const smpOftAdapter = await ethers.getContractAt("SeamoonProtocolAdapter", config.networks[srcChain].oftAdapter);
    
    // Fetching the native fee for the token send operation
    const [nativeFee] = await smpOftAdapter.quoteSend(sendParam, false) 

    const token = await ethers.getContractAt("IERC20", config.networks[srcChain].tokenAddress);
    
    // Approving the native fee to be spent by the myOFTA contract
    const approveTx = await token.approve(smpOftAdapter.address, tokensToSend);
    await approveTx.wait();
    
    // Executing the send operation from myOFTA contract
    await smpOftAdapter.send(sendParam, [nativeFee, 0], receiver, { value: nativeFee })
  }
  
  async function sendFromL2(srcChain: string, dstChain: string, receiver: string, tokensToSend: bigint, ethers: any) { 
  
    // Defining extra message execution options for the send operation
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
    
    const sendParam = [
        config.networks[dstChain].eid,
        ethers.utils.zeroPad(receiver, 32),
        tokensToSend,
        tokensToSend,
        options,
        '0x',
        '0x',
    ]
  
    const smpOft = await ethers.getContractAt("SeamoonProtocol", config.networks[srcChain].oft);
  
    // Fetching the native fee for the token send operation
    const [nativeFee] = await smpOft.quoteSend(sendParam, false)
  
    // Executing the send operation from myOFTA contract
    await smpOft.send(sendParam, [nativeFee, 0], receiver, { value: nativeFee })
  }

task('sendOFT', 'Send OFT from one chain to another')
    .addParam('srcchain', 'source chain', '', types.string) 
    .addParam('dstchain', 'destination chain', '', types.string) 
    .addParam('receiver', 'receiver', '', types.string)
    .addParam('amount', 'amount to be sent', '', types.string) 
    .setAction(async function (args, { ethers }) {
        const { srcchain, dstchain, receiver, amount } = args;
        let tokensToSend = ethers.utils.parseEther(amount);
        
        if (config.networks[srcchain] === undefined || config.networks[dstchain] === undefined) {
            throw new Error("Invalid chain name");
        } else if (config.main == srcchain) {
            await sendFromL1toL2(srcchain, dstchain, receiver, tokensToSend, ethers);
        } else {
            await sendFromL2(srcchain, dstchain, receiver, tokensToSend, ethers);
        }

    })

    