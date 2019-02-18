# AFP.js

AFP.js is a typescript implementation of the AFP protocol. It allows developers to create and manage AFP contracts.

## Overview

...

## Usage

### Setup
```js
import { AFP, Contract } from './afp.js';

const afp = await AFP.init(web3, RELAYER_URL);
```

### Creating a Contract
```js
const contract = await Contract.create(
  afp, 
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
