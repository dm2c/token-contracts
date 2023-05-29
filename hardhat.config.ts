import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkAccountsConfig } from "hardhat/types";

import "hardhat-typechain";
import "hardhat-watcher"
import "solidity-coverage";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
require("hardhat-contract-sizer");

import "solc";

const accounts = (): HttpNetworkAccountsConfig => {
  if (!process.env.PRIV_KEY) {
    return "remote";
  }
  return [process.env.PRIV_KEY!];
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 3,
      gas: 850000,
      gasPrice: 1000000001,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 4,
      //gas: 850000,
      //gasPrice: 1000000001,
    },
    goeril: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 5,
      gas: 850000,
      gasPrice: 1000000001,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 1,
      gasPrice: 50000000001,
    },
    mumbai: {
      // matic testnet
      url: "https://rpc-mumbai.maticvigil.com/",
      chainId: 80001,
      // gas: 850000,
      // gasPrice: 8000000001,
    },
    matic: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 137,
      gas: 8500000,
      timeout: 20000,
      gasPrice: 200000000000,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
      clearOnStart: true,
      start: 'echo Running my test task now..',
    }
  }
};

export default config;
