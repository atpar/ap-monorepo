# Protocol

This package contains the ACTUS Protocol smart contracts as well as a Typescript SDK for easier interaction with the smart contracts.
The foundation of the protocol is the Solidity implementation of **ACTUS** Contract Types (https://www.actusfrf.org/algorithmic-standard) which is part of the package.

## Documentation
https://docs.atpar.io/

## Usage

Install via yarn or npm
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
See [README](../../README.md) in root directory.

### Testing
```sh
yarn test
```

### Deploy to local ganache chain
```sh
yarn ap-chain:setup
```

### Listing addresses of a deployment
```sh
cd deployments/<deployment>
find ./*.json | while read f ; do echo -n "$f: " ; cat "$f" | jq -r '.receipt.contractAddress' ; done
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

For an example, please review the [Issue and service a loan](https://docs.atpar.io/guides/issue-and-service) guide.

## Contract Types
- [x] ANN (Annuity)
- [x] CEC (Contract Enhancement Collateral)
- [x] CEG (Contract Enhancement Guarantee)
- [x] CERTF (Certificate)
- [x] COLLA (Simplified Principal At Maturity with Collateral)
- [x] PAM (Principal At Maturity)
- [x] STK (Stock)

## Implemented Conventions
- [x] Contract-Role-Sign-Convention (for PAM)

### Annuity-Payment-Conventions
- [ ] Simplified Analytical Annuity Calculation

### Business-Day-Count-Conventions
- [x] SCF (Shift/Calculate following)
- [x] SCMF (Shift/Calculate modified following)
- [x] CSF (Calculate/Shift following)
- [x] CSMF (Calculate/Shift modified following)
- [x] SCP (Shift/Calculate preceding)
- [x] SCMP (Shift/Calculate modified preceding)
- [x] CSP (Calculate/Shift preceding)
- [x] CSMP (Calculate/Shift modified preceding)

### End-Of-Month-Conventions
- [x] Same Day Shift
- [x] End-Of-Month Shift

### Year-Fraction-Conventions (Day-Count-Methods)
- [x] A/AISDA (Actual Actual ISDA)
- [x] A/360 (Actual Three Sixty)
- [x] A/365 (Actual Three Sixty Five)
- [x] 30E/360ISDA (Thirty E Three Sixty ISDA)
- [x] 30E/360 (Thirty E Three Sixty)
- [x] 28E336 (Twenty Eight E Three Thirty Six)
- [x] ONE (One Intraday)
- [x] OBYT (OneBy Twelve Intraday)
- [x] HRSAA (Hours Actual Actual Intraday)
- [x] MINAA (Minutes Actual Actual Intraday)
- [x] SECAA (Seconds Actual Actual Intraday)


## Data types
All ACTUS related types depended on [atpar/actus-dictionary](https://github.com/atpar/actus-dictionary). 
With the exception of Array types, ACTUS types are one to one mapped in Solidity.

| ACTUS Dictionary data type            | Corresponding Solidity data type                                    |
|---------------------------------------|---------------------------------------------------------------------|
| Timestamp (ISO8601 Datetime)          | uint256 (Unix Timestamp in sec.)                                    |
| Real                                  | int256 (10 ** 18, fixed point)                                      |
| Integer                               | int256 (10 ** 18, fixed point)                                      |
| Varchar                               | bytes32 or bytes (depending on length)                              |
| Enum                                  | enum                                                                |
| Period (ISO8601 Duration)             | struct (IP where I: uint256, P: enum, isSet: boolean)               |
| Cycle ([ISO8601 Duration] L[s={0,1}]) | struct (IPS where I: uint256, P: enum, S: enum, isSet: boolean)     |
| ContractReference                     | struct (object: bytes32, object2: bytes32, _type: enum, role: enum) |


## Contributing

### Updating ACTUS types througout the project
If the underlying ACTUS types change in [atpar/actus-dictionary](https://github.com/atpar/actus-dictionary)
, the following files and directories may be affected and have to be updated manually:
- [ACTUSTypes.sol](contracts/ACTUS/Core/ACTUSTypes.sol)
| [Encoder libaries e.g. ANNEncoder](contracts/Core/ANN/ANNEncoder.sol)
| [ACTUS.ts](src/types/ACTUS.ts)
| [AP.ts](src/types/AP.ts)
| [Dictionary.ts](src/types/dictionary/dictionary.json)
| [Constants.ts](src/utils/Constants.ts)
| [Conversions.ts](src/utils/Conversion.ts)
| [Schedule.ts](src/utils/Schedule.ts)
| [Test helpers](test/helper)
