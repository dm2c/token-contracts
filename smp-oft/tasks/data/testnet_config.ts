
const config = {
    main: 'sepolia',
    networks: {
        'sepolia': {
            eid: 40161,
            endpointAddress: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            oftAdapter: '0x5fbab85357E66Aef86e41652e47C2Ddf512040A1',
            tokenAddress: '0xB2B0A672a8e5428f034B2eB1ed1978b25A108B27', // Set the token address for the OFT adapter
        },
        'op-sepolia': {
            eid: 40232,
            endpointAddress: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            oft: '0xDC5d5E0D1FfE846310d0f3E6545456f80646AB0a'
        },
        'dm2-verse-testnet': {
            eid: 40321,
            endpointAddress:  '0x3aCAAf60502791D199a5a5F0B173D78229eBFe32',
            oft: '0xEab312AD25Bf04216DEBA77F6cEa92631Cb75d63'
        }
    }
}

export default config;