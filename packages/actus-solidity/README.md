# **ACTUS** Solidity

[![Build Status](https://travis-ci.org/atpar/actus-solidity.svg?branch=MS1)](https://travis-ci.org/atpar/actus-solidity)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](http://img.shields.io/npm/v/actus-solidity.svg?style=flat)](https://npmjs.org/package/actus-solidity "View this project on npm")
[![Coverage Status](https://coveralls.io/repos/github/atpar/actus-solidity/badge.svg?branch=master)](https://coveralls.io/github/atpar/actus-solidity?branch=master)

**DISCLAIMER: THIS IS A WORK IN PROGRESS AND NOT AUDITED. USE IT AT YOUR OWN RISK.**

Solidity implementation of **ACTUS** Contract Types (https://www.actusfrf.org/algorithmic-standard)

Demo: [**ACTUS Solidity Calculator**](https://www.atpar.io/actus-solidity-tool/dist/index.html) running on Görli Testnet.

## Smart Contracts

### Core
Contains banking-grade financial logic such as ACTUS day-count & end-of-month conventions, ACTUS datatypes and floating point arithmetic used throughout all ACTUS engines. 

### Engines
Contains ACTUS state machine engines for each ACTUS Contract Type. An Engine implements the state transition & payoff functions and the schedule generation logic for an ACTUS Contract Type. Engines are stateless smart contracts, thus can be used on-chain as well as off-chain (e.g. by using the EVM as a TEE).

## Development

### Requirements
- `node`: >=10.0.0 <11.0.0
- `npm`: >=6.8.0
- `yarn`: 1.16.0
- `truffle`
- `ganache-cli`
- `jq` (only for generating artifacts)

Note, install truffle and ganache-cli using npm as follows:
```sh
npm install -g truffle
npm install -g ganache-cli
```

### Run
1. install dependencies
```sh
# contracts/
yarn install
```

2. deploy contracts and run tests
```sh
# contracts/
yarn test
```

### Deployments
| Network  | ANNEngine                                  | PAMEngine                                  | SignedMath                                 |
|----------|--------------------------------------------|--------------------------------------------|--------------------------------------------|
| Görli    | 0xF7584Ac4375890505ccAbe43927F061284Ff30dD | 0xAd135adab829EEdc52a1c5c24741F4196f2D71A0 | 0xE9692a8E5eAaE6a01A82BB734A42cBA0A9b0541a |
| Kovan    | 0xF7584Ac4375890505ccAbe43927F061284Ff30dD | 0xAd135adab829EEdc52a1c5c24741F4196f2D71A0 | 0xE9692a8E5eAaE6a01A82BB734A42cBA0A9b0541a |
| Rinkeby  | 0x53162Fd13940fD778F024982a756faa64CECf9a3 | 0xBDB1624D894A62b4fB3B3D9bE20b1F69Ba969cD4 | 0x27bd9D7c156AF2BC60e0B2b458D716e080066697 |
| Ropsten  | 0x53162Fd13940fD778F024982a756faa64CECf9a3 | 0xBDB1624D894A62b4fB3B3D9bE20b1F69Ba969cD4 | 0x27bd9D7c156AF2BC60e0B2b458D716e080066697 |

## Implemented Conventions
- [x] Contract-Role-Sign-Convention (for PAM)
- [x] Contract-Default-Convention

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
- [ ] 30/360 (Thirty Three Sixty)
- [ ] BUS/252 (Business Two Fifty Two)
- [x] 1/1

### End-Of-Month-Conventions
- [x] Same Day Shift
- [x] End-Of-Month Shift