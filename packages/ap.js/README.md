# AP.js

AP.js is a typescript implementation of the ACTUS protocol. It allows developers to create and manage ACTUS protocol contracts.

## Overview

...

## Usage

### Setup
```js
import { AP, Contract } from './ap.js';

const ap = await AP.init(web3, RELAYER_URL);
```

### Creating a Contract
```js
const contract = await Contract.create(
  ap, 
  CONTRACT_TERMS, 
  RECORD_CREATOR_ADDRESS, 
  COUNTERPARTY_ADDRESS,
  { from: RECORD_CREATOR_ADDRESS, gas: 6000000 } // optional
);
```

## Development

### Install
```sh
yarn install

# compile typescript to js
yarn build
```

### Testing
```sh
yarn test
```
