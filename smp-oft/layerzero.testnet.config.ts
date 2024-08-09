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
const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'SeamoonProtocolAdapter',
}

const opSepoliaContract: OmniPointHardhat = {
    eid: EndpointId.OPTSEP_V2_TESTNET,
    contractName: 'SeamoonProtocol',
}

const amoyContract: OmniPointHardhat = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'SeamoonProtocol',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: opSepoliaContract,
        },
        {
            contract: sepoliaContract,
        },
        {
            contract: amoyContract,
        },
    ],
    connections: [
        {
            from: opSepoliaContract,
            to: sepoliaContract,
        },
        {
            from: opSepoliaContract,
            to: amoyContract,
        },
        {
            from: sepoliaContract,
            to: opSepoliaContract,
        },
        {
            from: sepoliaContract,
            to: amoyContract,
        },
        {
            from: amoyContract,
            to: sepoliaContract,
        },
        {
            from: amoyContract,
            to: opSepoliaContract,
        },
    ],
}

export default config
