# AP-Contracts

This package contains the ACTUS protocol smart contracts.

## Smart Contracts

...

## Overview

...

## Development

### Requirements
- NPM (6.2.0)
- install truffle-cli and ganache-cli or run commands with 
```sh
npm install -g truffle # truffle@v5.0.2
npm install -g ganache-cli
```

### Run
1. install dependencies
```sh
# ap-contracts/
yarn install
```

2. start ganache
```sh
ganache-cli --defaultBalanceEther 1000000
```

3. deploy contracts and run tests
```sh
# ap-contracts/
truffle compile
truffle migrate --network development
truffle test
```
