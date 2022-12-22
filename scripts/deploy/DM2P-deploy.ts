
import { ethers } from 'hardhat'
import { KmsSigner } from "../common"
import { DM2P } from "typechain"

const main = async () => {
    const signer = KmsSigner()
    const DM2P = await ethers.getContractFactory("DM2P");

    const contract = (await DM2P.connect(signer).deploy({gasLimit:  2000000})) as DM2P
    await contract.deployed();

    console.log('deployed txHash:', contract.deployTransaction.hash);
    console.log('deployed address:', contract.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


