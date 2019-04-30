# AP-Contracts

This package contains the ACTUS protocol smart contracts.

## Smart Contracts

### APCore
Contains banking-grade financial logic such as ACTUS day-count & end-of-month conventions, ACTUS datatypes and floating point arithmetic used throughout all ACTUS protocol engines. 

### APEngines (PAMEngine, ANNEngine, ...)
Contains ACTUS state machine engines for each ACTUS contract type. An APEngine implements the state transition & payoff functions and the schedule generation logic for an ACTUS contract type. An APEngine is a stateless smart contract that can be used in various ways (e.g. on-chain or off-chain state derivation).

### Registries
ACTUS protocol is made up of three global registries:
- Ownership Registry (stores the addresses of the obligors and beneficiaries for assets)
- Economics Registry (stores the terms and the current state of an asset)
- Payment Registry (stores payment metadata for obligations)

### Payment Router
Routes payments from the obligor (payer) to the beneficiary (payee) and registers the amount paid for each obligation in the Payment Registry.

### Asset Actor
The Asset Actor acts as the executive of ACTUS protocol. The Asset Actor registers a new asset by storing the owners of the asset in the Ownership Registry and by deriving and storing its initial state in the Economics Registry. 
It derives the next state of an asset by querying the last state from the Economics Registry and computing the next state from the corresponding ACTUS engine. In the future dispute resolution will be enforced by the Asset Actor as well. 
There are going to be multiple Asset Actor contracts depending on the protocol. So we might have a special Asset Actor contract for a hybrid (on-chain / off-chain) implementation of ACTUS protocol.

### AssetIssuer
An asset can be issued from a co-signed order (order which is signed by the maker and taker) via the Asset Issuer. The Asset Issuer verifies the provided signatures and initiates the issuance by passing the terms and the ownership to the Asset Actor.

### Tokenization Module (ClaimsToken)
Every beneficiary in ACTUS protocol can be tokenized by updating the beneficiary address in the Ownership Registry with the address of a new instance of the ClaimsToken contract. The Payment Router automatically routes future payments to the corresponding ClaimsToken contract. The ClaimsToken contract handles the distribution of incoming funds to all ClaimsToken holders. (see EIP-1726 for more information)

## Development

### Requirements
- jq
- NPM (6.2.0)
- install truffle-cli and ganache-cli or run commands with 
```sh
npm install -g truffle # truffle@v5.0.2
and storingnpm install -g ganache-cli
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
