import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.17",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.27",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  networks: {
    hardhat: {
      // chainId: 9372,
      // forking: {
      //   url: 'https://rpc.testnet.oasys.games/',
      //   blockNumber: 4560000,
      // },
      chainId: 68775,
      forking: {
        url: "https://rpc.testnet.dm2verse.dmm.com/",
        blockNumber: 101400,
      },
    },
    oasys_main: {
      url: "https://rpc.mainnet.oasys.games/",
      chainId: 248,
      accounts: [process.env.PRIVATE_KEY],
    },
    oasys_test: {
      url: "https://rpc.testnet.oasys.games/",
      chainId: 9372,
      accounts: [process.env.PRIVATE_KEY],
    },
    dm2: {
      url: "https://rpc.mainnet.dm2verse.dmm.com/",
      chainId: 68770,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 0,
    },
    dm2test: {
      url: "https://rpc.testnet.dm2verse.dmm.com/",
      chainId: 68775,
      accounts: [process.env.PRIVATE_KEY],
    },
    sand: {
      url: "https://rpc.sandverse.oasys.games/",
      chainId: 20197,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 0,
    },
  },
  etherscan: {
    apiKey: {
      oasys_test: "test",
      dm2: "test",
      dm2test: "test",
    },
    customChains: [
      {
        network: "oasys_test",
        chainId: 9372,
        urls: {
          apiURL: "https://explorer.testnet.oasys.games/api",
          browserURL: "https://explorer.testnet.oasys.games/",
        },
      },
      {
        network: "dm2",
        chainId: 68770,
        urls: {
          apiURL: "https://explorer.dm2verse.dmm.com/api",
          browserURL: "https://explorer.dm2verse.dmm.com",
        },
      },
      {
        network: "dm2test",
        chainId: 68775,
        urls: {
          apiURL: "https://explorer.testnet.dm2verse.dmm.com/api",
          browserURL: "https://explorer.testnet.dm2verse.dmm.com",
        },
      },
    ],
  },
};

export default config;
