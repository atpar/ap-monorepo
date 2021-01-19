<img src="https://user-images.githubusercontent.com/45110941/99552473-55349800-29bd-11eb-9a74-53c9815c39b1.jpg" width="150px"> 

![Build Status](https://github.com/atpar/ap-monorepo/workflows/Run%20Tests/badge.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Coverage Status](https://coveralls.io/repos/github/atpar/ap-monorepo/badge.svg?branch=master)](https://coveralls.io/github/atpar/ap-monorepo?branch=master)

---

[ACTUS Protocol](https://docs.atpar.io/) is an open source smart contract system and Typescript SDK for issuing and servicing financial assets on Ethereum. It is build on top of a free and open-source implementation of the [ACTUS standard](https://www.actusfrf.org/).

If you're interested to get involved, follow us on [Twitter](https://twitter.com/at_par_), join our [Discord](https://discord.gg/WdAhDYq), and [try one of our guides](https://docs.atpar.io/guides/getting-started)!

**The ACTUS Protocol is a work in progress and has NOT been audited. Use at your own risk.**

## Documentation
https://docs.atpar.io/

## Packages

This is a monorepo containing all packages related to the ACTUS Protocol.

| Package                                                                          | Description                                                                    |
|----------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| [`protocol`](packages/protocol/README.md) | Contains the Solidity implementation the ACTUS Protocol and the typescript sdk |

## Development
### Requirements
The versions provided are confirmed to work without any issues. Newer or older versions of the packages might work too.
- [node](https://nodejs.org/en/) [10.16.0] (recommended installing it via [nvm](https://github.com/nvm-sh/nvm))
- [yarn](https://yarnpkg.com/) [1.16.0] (recommended installing it as global npm package)

### Setup
```sh
yarn install
yarn bootstrap
```

### Building
```sh
yarn build
```

### Testing
```sh
yarn test
```

---

ACTUS Protocol is maintained by  
[<img src="https://user-images.githubusercontent.com/45110941/99552627-82814600-29bd-11eb-869a-e224eedfcfa2.jpg" width="200px" >](https://www.atpar.io)
