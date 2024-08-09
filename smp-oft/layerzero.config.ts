import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

/**
 *  WARNING: ONLY 1 OFTAdapter should exist for a given global mesh.
 *  The token address for the adapter should be defined in hardhat.config. This will be used in deployment.
 *
 *  for example:
 *
 *    sepolia: {
 *         eid: EndpointId.SEPOLIA_V2_TESTNET,
 *         url: process.env.RPC_URL_SEPOLIA || 'https://rpc.sepolia.org/',
 *         accounts,
 *         oft-adapter: {
 *             tokenAddress: '0x0', // Set the token address for the OFT adapter
 *         },
 *     },
 */
const ethereumContract: OmniPointHardhat = {
    eid: EndpointId.ETHEREUM_V2_MAINNET,
    contractName: 'SeamoonProtocolAdapter',
}

const optimismContract: OmniPointHardhat = {
    eid: EndpointId.OPTIMISM_V2_MAINNET,
    contractName: 'SeamoonProtocol',
}

// const dmmContract: OmniPointHardhat = {
//     eid: EndpointId.DMM_MAINET,
//     contractName: 'SeamoonProtocol',
// }

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: optimismContract,
        },
        {
            contract: ethereumContract,
        },
    ],
    connections: [
        {
            from: optimismContract,
            to: ethereumContract,
        },
        {
            from: ethereumContract,
            to: optimismContract,
        },
    ],
}

export default config
