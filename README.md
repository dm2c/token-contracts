# Token Contracts

This repository contains the source code for the DM2P and DM2E token contracts.

## Token Types

| Name | Symbol | Decimals | Capped Supply | Mintable | Burnable | Pausable |
| --- | --- | --- | --- | --- | --- | --- |
| DM2P | DM2P | 18 | 1e10 | Yes | Yes | Yes |
| DM2E | DM2E | 18 | No | Yes | Yes | Yes |

 - DM2P is a governance token that is capped.
 - DM2E is an utility token that is not capped.

## ERC20
The following features will be determined at deploy time, locking them in place.

 - Name
 - Symbol
 - Decimals

The following feature can be increased via minting and burning after deployment.

 - Total Supply

## Capped
The total supply of tokens to be minted is capped.
It is not possible to mint more than the upper limit.

## Roles
All accounts need to be granted a role by an admin in order to be able to interact with the contract's administrative functions:

 - DefaultAdminRole: Admins are responsible for managing permissions of all roles.
 - MinterRole: These accounts can mint new tokens to other accounts.
 - PauserRole: These accounts can halt all transfers on the contract.
 - BurnerRole: These accounts can burn tokens from accounts.

## Admins

Admin accounts can add and remove other account addresses to all Roles, including Admins. Admins can remove themselves from being an Admin, so care needs to be taken to ensure at least 1 address maintains Admin (unless the goal is to remove all Admins).

The account that deployed the contract will be the only Admin account by default.

## Pausing
The Pauser accounts may pause/un-pause the contract. When the contract is paused all transfers will be blocked. When deployed the contract is initially un-paused.

## Minting
Minter accounts can mint tokens to other accounts. Minting tokens increases the total supply of tokens and the balance of the account the tokens are minted to.

## Burning
Burner accounts can burn tokens from its own accounts. Burning tokens decreases the total supply of tokens and the balance of the account the tokens are burned from.

# Testing
You should be able to install dependencies and then run tests:
```
$ npm install
$ npx hardhat test test/DM2P.test.ts
```

# Deployment Procedure
```
npx hardhat compile
npx hardhat test test/DM2P.test.ts
# Fill in the contract address in DM2P: "" in scripts/common.ts
npx hardhat run scripts/deploys/DM2P-deploy.ts --network mainnet
```

## Operation confirmed version
 - Node.js v16.15.1
 - npm 8.19.2

## Audit

Past audits can be found in audits/.
