
const config = {
    main: 'ethereum',
    networks: {
        'ethereum': {
            eid: 30101,
            endpointAddress: '0x1a44076050125825900e736c501f859c50fE728c',
            oftAdapter: '0xcEb763AE6854796A00F8BAB60546960D0b272aAd',
            tokenAddress: '0x7D36F7D8e9220F021305B8F13414C87DF688aa8B', // Set the token address for the OFT adapter
        },
        'optimism': {
            eid: 30111,
            endpointAddress: '0x1a44076050125825900e736c501f859c50fE728c',
            oft: '0x5f5292FE4583f476ab90Fbf247999816a9503F9E',
        },
    }
}

export default config;