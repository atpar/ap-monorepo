# Protocol

This package contains the ACTUS Protocol smart contracts as well as a Typescript SDK for easier interaction with the smart contracts.
The foundation of the protocol is the Solidity implementation of **ACTUS** Contract Types (https://www.actusfrf.org/algorithmic-standard) which is part of the package.

## Documentation
https://docs.actus-protocol.io/

## Usage

Install via yarn or npm
- Note this package is hosted on GitHub Packages and requires additional configuration. See [GitHub docs](https://docs.github.com/en/free-pro-team@latest/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages).
```sh
yarn add @atpar/protocol
```

Importing contracts
```sol
import "@atpar/protocol/contracts/....sol";
```

Using the Typescript SDK
```ts
import { AP } from '@atpar/protocol';
// tested with web3@1.2.4 - other versions may cause typing issues
const ap = await AP.init(web3, ADDRESS_BOOK);
```

## Development

### Requirements and Setup
See [README](https://github.com/atpar/ap-monorepo) in root directory.

### Testing
```sh
yarn test
```

### Deploy to local ganache chain
```sh
yarn ap-chain:setup
```

## Smart Contracts

### ACTUS Core
Contains banking-grade financial logic such as ACTUS day-count & end-of-month conventions, ACTUS datatypes and floating point arithmetic used throughout all ACTUS engines. 

### ACTUS Engines
Contains ACTUS state machine engines for each ACTUS Contract Type. An Engine implements the state transition & payoff functions and the schedule generation logic for an ACTUS Contract Type. Engines are stateless smart contracts, thus can be used on-chain as well as off-chain (e.g. by using the EVM as a TEE).

### Core
Contains the protocol which is build on top of ACTUS Core and the ACTUS Engines.

### Basic workflow
1. Define an ACTUS term sheet depending on the financial contract you want to model and set up the ownership structure
2. Use the appropriate Asset Actor contract (e.g. the PAMActor) to initialize and register the new asset on chain
3. Make sure that the Asset Actor has the required token allowances and progress the asset vie the `progress()` function.

For an example, please review the [Issue and service a loan](https://docs.actus-protocol.io/guides/issue-and-service) guide.

## Contract Types
- [x] ANN (Annuity)
- [x] CEC (Contract Enhancement Collateral)
- [x] CEG (Contract Enhancement Guarantee)
- [x] CERTF (Certificate)
- [x] PAM (Principal At Maturity)
- [x] STK (Stock)

## Implemented Conventions
- [x] Contract-Role-Sign-Convention (for PAM)

### Business-Day-Count-Conventions
- [x] SCF (Shift/Calculate following)
- [x] SCMF (Shift/Calculate modified following)
- [x] CSF (Calculate/Shift following)
- [x] CSMF (Calculate/Shift modified following)
- [x] SCP (Shift/Calculate preceding)
- [x] SCMP (Shift/Calculate modified preceding)
- [x] CSP (Calculate/Shift preceding)
- [x] CSMP (Calculate/Shift modified preceding)

### Year-Fraction-Conventions (Day-Count-Methods)
- [x] A/AISDA (Actual Actual ISDA)
- [x] A/360 (Actual Three Sixty)
- [x] A/365 (Actual Three Sixty Five)
- [x] 30E/360ISDA (Thirty E Three Sixty ISDA)
- [x] 30E/360 (Thirty E Three Sixty)
- [ ] 28E336 (Twhenty-Eight E Three Thirty-Six)
- [ ] BUS/252 (Business Two Fifty Two)
- [ ] 1/1

### End-Of-Month-Conventions
- [x] Same Day Shift
- [x] End-Of-Month Shift