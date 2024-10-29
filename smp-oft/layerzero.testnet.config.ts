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

const dm2TestContract: OmniPointHardhat = {
    eid: EndpointId.DM2VERSE_V2_TESTNET,
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
            contract: dm2TestContract,
        },
    ],
    connections: [
        {
            from: opSepoliaContract,
            to: sepoliaContract,
        },
        {
            from: opSepoliaContract,
            to: dm2TestContract,
        },
        {
            from: sepoliaContract,
            to: opSepoliaContract,
        },
        {
            from: sepoliaContract,
            to: dm2TestContract,
        },
        {
            from: dm2TestContract,
            to: sepoliaContract,
        },
        {
            from: dm2TestContract,
            to: opSepoliaContract,
        },
    ],
}

export default config
