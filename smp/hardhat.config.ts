import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkAccountsConfig } from "smp/node_modules/hardhat/types";

import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-watcher";
import "solidity-coverage";
import { configDotenv } from "dotenv";
require("hardhat-contract-sizer");
configDotenv();

import "solc";

const accounts = (): HttpNetworkAccountsConfig => {
  if (!process.env.PRIV_KEY) {
    return "remote";
  }
  return [process.env.PRIV_KEY!];
};

const config: HardhatUserConfig = {
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
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
    tests: "./test",
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
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: true,
      clearOnStart: true,
      start: "echo Running my test task now..",
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
};

export default config;
