# AP-Contracts

This package contains the ACTUS Protocol smart contracts.
AP-Contracts depends on [`actus-solidity`](https://github.com/atpar/actus-solidity) and uses ACTUS definitions and ACTUS engines throughout the following smart contracts.

## Documentation
https://docs.actus-protocol.io/ap-contracts/overview

## Development

### Requirements
- `jq` (only for generating artifacts)
```sh
# requires homebrew
brew install jq
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
