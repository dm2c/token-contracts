
const config = {
    main: 'sepolia',
    networks: {
        'sepolia': {
            eid: 40161,
            endpointAddress: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            oftAdapter: '<OFT Adapter Address>',
            tokenAddress: '<SMP Token Address>', // Set the token address for the OFT adapter
        },
        'op-sepolia': {
            eid: 40232,
            endpointAddress: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            oft: '<OFT Token Address>'
        },
        'amoy': {
            eid: 40267,
            endpointAddress: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            oft: '<OFT Token Address>'
        },
        // 'dmm-verse-testnet': {
        //     eid: <endpoint_id>,
        //     endpointAddress:  <address>,
        //     oft: <address>
        // }
    }
}

export default config;