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
import { AP, Asset, Order } from './ap.js';

const ap = await AP.init(
  web3, 
  DEFAULT_ACCOUNT
);
```

### Order
`Order` is a wrapper around the `IssuanceAPI` for creating orders and issuing assets from a co-signed orders.
```ts
const orderParams: OrderParams = {
  makerAddress: MAKER_ADDRESS,
  terms: CONTRACT_TERMS,
  makerCreditEnhancementAddress: '0x0000000000000000000000000000000000000000'
};

const order = Order.create(ap, orderParams);
```

Serializing an `Order` as `OrderData`
```ts
const orderData: OrderData = Order.serializeOrder();
```

Instantiate an `Order` from `OrderData`.
```ts
const orderData: OrderData = {
  makerAddress: MAKER_ADDRESS;
  takerAddress: null; // depending on if order was filled by taker
  actorAddress: ACTOR_ADDRESS;
  terms: CONTRACT_TERMS;
  makerCreditEnhancementAddress: MAKER_CREDIT_ENHANCEMENT_ADDRESS;
  takerCreditEnhancementAddress: null; // depending on if order was filled by taker
  salt: SALT;
  signatures: {
    makerSignature: null; // depending on if order was signed by maker
    takerSignature: null; // depending on if order was signed by taker
  };
};

const order = Order.load(ap, orderData);
```

Signing and sending an order to an order-relayer (as a maker or taker).
```ts
await order.signOrder();
```

Issue a new asset from an co-signed order (requires both signatures).
```ts
await order.issueAssetFromOrder();
```

### Asset
`Asset` is a wrapper around `AP.js` APIs to make the creation and the lifecycle management of an ACTUS asset easier.

Creating a new Asset.
```ts
const asset = await Asset.create(ap, CONTRACT_TERMS, ASSET_OWNERSHIP);
```

Loading a `Asset` given its AssetId from the on-chain registries.
```ts
const asset = await Asset.load(ap, ASSET_ID);
```

Retrieve information of the asset such as the terms, the state or the ownership.
```ts
const terms = await asset.getTerms();
```

Expected Schedule vs. Pending schedule:
Every ACTUS asset has a planned (expected) schedule 
which is derived from the asset terms. During the lifecycle of an asset unexpected events
such as penalty payments or rate resets can occur. The pending schedule accounts for such unexpected events 
by factoring in the current state of the asset.
```ts
const expectedSchedule = await asset.getExpectedSchedule();
const pendingSchedule = await asset.getPendingSchedule();
```

Settlement of obligations: The next obligation is the most immediate obligation which is not yet paid off.
```ts
const amount = await getAmountOutstandingForNextObligation(TIMESTAMP);
await asset.settleNextObligation(TIMESTAMP, amount); // can also be partially paid off
```

Progressing the state of the asset. If all obligations in of the pending schedule are paid off, 
the state of the asset can be updated.
```ts
await asset.progress(); // progresses the state to the current block timestamp
```

Tokenizing the one of the beneficiaries of the asset. 
Tokenizes the beneficary (respective to the default accounts ownership of the asset) 
by deploying a new ClaimsToken smart contract.
```ts
const claimsTokenAddress = await asset.tokenizeBeneficiary();
```


## API Overview
| API             | Description                                                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------|
| ContractsAPI    | wrapper around the ACTUS Protocol smart contracts                                                                                   |
| EconomicsAPI    | interact with actus-solidity engines - retrieve terms, state and the current EventId of a registered asset                          |
| IssuanceAPI     | issue an ACTUS asset by filling a co-signed order - listen for new issued assets and retrieve the assetIds of all issued assets     |
| LifecycleAPI    | initialize a new asset (registering terms, initial state and ownership) - progress the state of an registered asset                 |
| OwnershipAPI    | retrieve the ownership of an asset - update the address of beneficiaries                                                            |
| PaymentAPI      | settle an obligation - retrieve the amount settled for a given timeframe                                                            |
| TokenizationAPI | tokenize an asset by deploying a new ClaimsToken smart contract - interact with ClaimsToken smart contract (withdrawing funds etc.) |

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
