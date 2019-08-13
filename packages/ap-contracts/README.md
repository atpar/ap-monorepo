# AP-Contracts

This package contains the ACTUS Protocol smart contracts.

## Smart Contracts

### ACTUS-Solidity
AP-Contracts depends on [`actus-solidity`](https://github.com/atpar/actus-solidity) and uses ACTUS definitions and ACTUS engines throughout the following smart contracts.

### Registries
ACTUS Protocol is made up of two global registries:
- Asset Registry (stores the addresses of the obligors and beneficiaries and the terms and the current state of assets)
- Payment Registry (stores payment metadata for settling obligations)

### Payment Router
Routes payments from the obligor (payer) to the beneficiary (payee) and registers the amount paid for each obligation in the Payment Registry.

### Asset Actor
The Asset Actor acts as the executive of ACTUS Protocol. The Asset Actor registers a new asset by storing the owners of the asset and by deriving and storing its initial state in the Asset Registry. 
It derives the next state of an asset by querying the last state from the Asset Registry and computing the next state via the corresponding ACTUS engine. In the future dispute resolution will be enforced by the Asset Actor as well. 
There are going to be multiple Asset Actor contracts depending on the protocol. So we might have a special Asset Actor contract for a hybrid (on-chain / off-chain) implementation of ACTUS Protocol.

### AssetIssuer
An asset can be issued from a co-signed order (order which is signed by the maker and taker) via the Asset Issuer. The Asset Issuer verifies the provided signatures and initiates the issuance by passing the terms and the ownership to the Asset Actor.

### Tokenization Module (Funds Distribution Token)
Every beneficiary in ACTUS Protocol can be tokenized by updating the beneficiary address in the Ownership Registry with the address of a new instance of the FDT contract. The Payment Router automatically routes future payments to the corresponding FDT contract. The FDT contract handles the distribution of incoming funds to all FD-Token holders. (see [EIP-2222](https://github.com/atpar/funds-distribution-token) for more information)

## Development

### Requirements
- `jq` (only for generating artifacts)
- `NPM` (6.2.0)
- `truffle` and `ganache-cli`
```sh
npm install -g truffle
npm install -g ganache-cli
```

### Run
1. install dependencies
```sh
# ap-contracts/
yarn install
```

2. deploy contracts and run tests
```sh
# ap-contracts/
yarn test
```
