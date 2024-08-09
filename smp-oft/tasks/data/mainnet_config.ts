
const config = {
    main: 'ethereum',
    networks: {
        'ethereum': {
            eid: 30101,
            endpointAddress: '0x1a44076050125825900e736c501f859c50fE728c',
            oftAdapter: '<OFT Adapter Address>',
            tokenAddress: '<SMP Token Address>', // Set the token address for the OFT adapter
        },
        'optimism': {
            eid: 30111,
            endpointAddress: '0x1a44076050125825900e736c501f859c50fE728c',
            oft: '<OFT Token Address>'
        },
    }
}

export default config;