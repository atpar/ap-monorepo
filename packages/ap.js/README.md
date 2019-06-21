# AP.js

AP.js is a typescript library for interacting with the ACTUS protocol smart contracts. 
It allows developers to create and manage ACTUS assets.

## Usage

```sh
yarn add @atpar/ap.js 
```

### Setup
Initializing the ACTUS protocol library.
```ts
import { AP, Asset, Order } from './ap.js';

const ap = await AP.init(
  web3, 
  DEFAULT_ACCOUNT, 
  { orderRelayer?: ORDER_RELAYER_URL, channelRelayer? :CHANNEL_RELAYER_URL }
);
```

### Order
`Order` is a wrapper around the Issuance API for creating orders and issuing assets from a co-signed orders.
```ts
const orderParams: OrderParams = {
  makerAddress: MAKER_ADDRESS,
  terms: CONTRACT_TERMS,
  makerCreditEnhancementAddress: '0x0000000000000000000000000000000000000000'
};

const order = Order.create(ap, orderParams);
```
Receiving orders from the orderbook of an order-relayer
```ts
ap.onNewOrder((order) => { ... });    
```
Signing and sending an order to an order-relayer (as a maker or taker)
```ts
await order.signAndSendOrder();
```

### Asset
`Asset` is a wrapper around AP.js APIs to make the creation and the lifecycle management of an ACTUS asset easier.

Creating a new Asset
```ts
const terms: ContractTerms = { ... };
const ownership: AssetOwnership = { ... };

const asset = await Asset.create(ap, CONTRACT_TERMS, CONTRACT_OWNERSHIP);
```
Loading a Asset given its AssetId from the on-chain registries
```ts
const asset = await Asset.load(ap, ASSET_ID);
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
