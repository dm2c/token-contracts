# Token Contracts

This repository contains the source code for the Seamoon Protocol token and related contracts.

See [this whitepaper](https://docs.seamoon.dmm.com/whitepaper/v/en/) for the entire Seamoon Protocol ecosystem that uses Seamoon Protocol token. 

## Projects

This repository contains the implementation of the Seamoon Protocol token and its associated contracts. 
The project is structured to separate the core Seamoon Protocol token implementation from related contracts that interact with or extend the functionality of the main token.

### Seamoon Protocol Token 

The `smp` directory contains the core implementation of our Seamoon Protocol token.

For more details, see the [Seamoon Protocol Token README](./smp/README.md).

### OFT Contracts

The `smp-oft` directory contains OFT contracts for integrating A tokens into each network using LayerZero

For more details, see the [OFT Contracts README](./smp-oft/README.md).

## Repository Structure

```
├── audits/: Audit reports 
├── smp/: Seamoon Protocol token contracts
└── smp-oft/: OFT contracts using LayerZero
```

## Audit

Past audits can be found in [`audits/`](./audits).

