# AP.js

AP.js is a typescript library for interacting with the ACTUS Protocol smart contracts. 
It allows developers to create and manage ACTUS assets.

## Usage

```sh
yarn add @atpar/ap.js 
```

### Setup
Initializing the ACTUS Protocol library.
```ts
import { AP, Asset, Order, APTypes } from './ap.js';

const addressBook: APTypes.AddressBook;

const ap = await AP.init(
  web3, 
  DEFAULT_ACCOUNT,
  addressBook // optional addresses specified in ap-contracts for the current network
);
```

### Order
`Order` contains methods for creating orders and issuing assets from a co-signed orders.
```ts
// see __tests__/utils.ts for structure of OrderParams
const order = Order.create(ap, orderParams);
```

Serializing an `Order` as `OrderData`
```ts
const orderData: APTypes.OrderData = Order.serializeOrder();
```

Instantiate an `Order` from `OrderData`.
```ts
const order = Order.load(ap, orderData);
```

Signing an order (as creator or counterparty obligor).
```ts
await order.signOrder();
```

Issue a new asset from an co-signed order (requires both signatures).
```ts
await order.issueAssetFromOrder();
```

### Asset
`Asset` is a wrapper around `AP.js` APIs to make the creation and the lifecycle management of an ACTUS asset easier.

Loading an `Asset` given its AssetId from the Asset Registry.
```ts
const asset = await Asset.load(ap, ASSET_ID);
```

Retrieve information of the asset such as the terms, the state or the ownership.
```ts
const terms = await asset.getTerms();
```

Schedule
```ts
const schedule = await asset.getSchedule();
```

Settlement of obligations: The next obligation is the most immediate obligation which is not yet paid off.
```ts
const payment = await asset.getNextPayment();
```

Settlement of obligations: The next obligation is the most immediate obligation which is not yet paid off.
```ts
const event = await asset.getNextEvent();
const decodedEvent = ap.utils.decodeEvent(event);
```

Progressing the state of the asset. Requires that the Asset Actor has sufficient allowance to settle the obligation of the pending event.
If there are unsettled obligation for the pending event, the actor will transition the state of the asset to a non-performant state.
```ts
await asset.progress(); // progresses the state to the current block timestamp
```

Tokenizing the one of the beneficiaries of the asset. 
Tokenizes the beneficary (respective to the default accounts ownership of the asset) 
by deploying a new Funds Distribution Token smart contract.
```ts
const distributorAddress = await asset.tokenizeBeneficiary();
```


## API Overview
| API             | Description                                                                                                                              |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Contracts       | wrapper around the ACTUS Protocol smart contracts                                                                                        |
| Signer          | signature utilities to sign and verify orders                                                                                            |

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
