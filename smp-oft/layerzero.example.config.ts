import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

/**
 *  This is example of DVN configuration. by npx lz:oapp:wire command, DVN configuration can be updated.
 *  For the detail configutaion, please see 
 *  https://github.com/LayerZero-Labs/devtools/blob/47b56ea51dd38f835a80c3ac8922139e6d091d6b/packages/toolbox-hardhat/README.md#for-example
 */

// Polyphedra DVN Addresses
// bnb-testnet: 0x2dDf08e397541721acD82E5b8a1D0775454a180B
// dm2verse-testnet: 0x5A9ee2465E9DC9D207237710B7358a5Cc19F9395

// Layerzero DVN Addresses
// bnb-testnet: 0x0ee552262f7b562efced6dd4a7e2878ab897d405
// dm2verse-testnet: 0x88b27057a9e00c5f05dda29241027aff63f9e6e0

const dm2verseContract: OmniPointHardhat = {
    eid: EndpointId.DM2VERSE_V2_TESTNET,
    contractName: 'SeamoonProtocol',
}

const bscContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_TESTNET,
    contractName: 'SeamoonProtocol',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: dm2verseContract,
        },
        {
            contract: bscContract,
        },
    ],
    connections: [
        {
            from: bscContract,
            to: dm2verseContract,
            config: {
                sendConfig: {
                    ulnConfig: {
                      confirmations: BigInt(2),
                      requiredDVNs: ["0x2dDf08e397541721acD82E5b8a1D0775454a180B"],
                      optionalDVNs: [],
                      optionalDVNThreshold: 0,
                    },
                },
                // Optional Receive Configuration
                receiveConfig: {
                    ulnConfig: {
                        confirmations: BigInt(2),
                        requiredDVNs: ["0x2dDf08e397541721acD82E5b8a1D0775454a180B"],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            }
        },
        {
            from: dm2verseContract,
            to: bscContract,
            config: {
                sendConfig: {
                    ulnConfig: {
                      confirmations: BigInt(2),
                      requiredDVNs: ["0x5A9ee2465E9DC9D207237710B7358a5Cc19F9395"],
                      optionalDVNs: [],
                      optionalDVNThreshold: 0,
                    },
                },
                // Optional Receive Configuration
                receiveConfig: {
                    ulnConfig: {
                        confirmations: BigInt(2),
                        requiredDVNs: ["0x5A9ee2465E9DC9D207237710B7358a5Cc19F9395"],//polyphedra
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            }
        },
    ],
}

export default config
