import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';
import config from '../tasks/data/mainnet_config.ts';

async function main(hre: HardhatRuntimeEnvironment) {
  
  let srcChain = hre.network.name;
  console.log(hre.network.name);
  let [deployer] = await ethers.getSigners();

  if (config.main === srcChain) {
    await hre.run("verify:verify", {
      address:  config.networks[srcChain].oftAdapter,
      constructorArguments: [
        config.networks[srcChain].tokenAddress,
        config.networks[srcChain].endpointAddress,
        deployer.address,
      ],
      contract: "contracts/SeamoonProtocolAdapter.sol:SeamoonProtocolAdapter",
    });
  } else {
    await hre.run("verify:verify", {
      address:  config.networks[srcChain].oft,
      constructorArguments: [
        'Seamoon Protocol', // name
        'SMP', // symbol
        config.networks[srcChain].endpointAddress,
        deployer.address,
      ],
      contract: "contracts/SeamoonProtocol.sol:SeamoonProtocol",
    });
  }

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});