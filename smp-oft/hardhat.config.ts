// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'
import "@nomicfoundation/hardhat-verify";
import './type-extensions'
import './tasks/sendOFT';

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            
        },
        'ethereum': {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            url: process.env.RPC_URL_ETHEREUM || 'https://mainnet.infura.io/v3/',
            accounts,
            oftAdapter: {
                tokenAddress: process.env.TOKEN_ADDRESS || '0x', // Set the token address for the OFT adapter
            },
        },
        'optimism': {
            eid: EndpointId.OPTIMISM_V2_MAINNET,
            url: process.env.RPC_URL_OPTIMISM || 'https://mainnet.optimism.io',
            accounts,
        },
        'sepolia': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://rpc.sepolia.org/',
            accounts,
            oftAdapter: {
                tokenAddress: process.env.TOKEN_ADDRESS_TESTNET || '0x', // Set the token address for the OFT adapter
            },
        },
        'op-sepolia': {
            eid: EndpointId.OPTSEP_V2_TESTNET,
            url: process.env.RPC_URL_OP_SEPOLIA || 'https://sepolia.optimism.io',
            accounts,
        },
        'amoy': {
            eid: EndpointId.AMOY_V2_TESTNET,
            url: process.env.RPC_URL_AMOY || 'https://polygon-amoy-bor-rpc.publicnode.com',
            accounts,
        },
        'dmm-verse-testnet': {
            //eid: EndpointId.DMM_V2_TESTNET,
            url: process.env.RPC_URL_DMM_TEST || 'https://rpc.testnet.dm2verse.dmm.com/',
            accounts,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
    etherscan: {
        apiKey: {
            ethereum: process.env.ETHERSCAN_API_KEY || '',
            optimism: process.env.OP_ETHERSCAN_API_KEY || '',
            sepolia: process.env.ETHERSCAN_API_KEY || '',
            'op-sepolia': process.env.OP_ETHERSCAN_API_KEY || '',
            amoy: process.env.POLYGON_SCAN_API_KEY || '',
        },
        customChains: [
            {
              network: "op-sepolia",
              chainId: 11155420,
              urls: {
                apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
                browserURL: "https://sepolia.optimism.io"
              }
            },
            {
              network: "amoy",
              chainId: 80002,
              urls: {
                apiURL: "https://api-amoy.polygonscan.com/api",
                browserURL: "https://amoy.polygonscan.com"
              }
            },
            {
              network: "ethereum",
              chainId: 1,
              urls: {
                apiURL: "https://api.etherscan.io/api",
                browserURL: "https://etherscan.io"
              }
            },
            {
              network: "optimism",
              chainId: 10,
              urls: {
                apiURL: "https://api-optimistic.etherscan.io/api",
                browserURL: "https://optimistic.etherscan.io/"
              }
            },
          ]
      },
}

export default config
