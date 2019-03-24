# AP.js

AP.js is a typescript implementation of the ACTUS protocol. 
It allows developers to create and manage ACTUS assets.

## Overview



## Usage

### Setup
Initializing the ACTUS protocol library.
```js
import { AP, Asset } from './ap.js';

const ap = await AP.init(web3, { orderRelayer?: ORDER_RELAYER_URL, channelRelayer? :CHANNEL_RELAYER_URL });
```

### Asset
`Asset` enables you to create and manage the lifecycle of an ACTUS asset.

Creating a new Asset
```js
const asset = await Asset.create(ap, CONTRACT_TERMS, CONTRACT_OWNERSHIP);
```
Loading a Asset given its AssetId from the on-chain registries
```js
const asset = await Asset.load(ap, ASSET_ID);
```

### Asset Channel
`AssetChannel` enables you to create and manage an Asset Channel (aka Financial State Channel). 
An Asset Channel only stores the minimum amount of information in order to resolve disputes on-chain. 
Consensus upon the current state of an ACTUS asset is solved by requiring each obligor on the record creator and 
counter party side to sign the current state of the asset. An AssetChannel only stores the initial terms and 
the ownership of the asset on-chain as well as payments made from the obligors to the beneficiaries.
Contract Updates are send through a relayer which hostname has to specified when instantiating `AP.js`. 

Creating a new Asset Channel
```js
const assetChannel = await AssetChannel.create(ap, CONTRACT_TERMS, CONTRACT_OWNERSHIP);
```
Listening for new Asset Channels that where opened by a counter party
```js
ap.onNewAssetChannel((assetChannel) => {
  console.log(assetChannel);
});
```
A `ChannelState` describes the action required by the user at a given point in time. A Asset Channel is either:
- `Idle`, if no action is required on both sides (no obligations to fullfill at this point in time),
- `Updatable`, if the users action is required by fullfilling the current obligations and updating the state of the contract,
- `Confirmable`, if the counter party awaits the signature of the user for the next state, or 
- `Receivable`, if action of the counter party is required by fillfilling obligations and updating the state of the contract.
```js
const channelState = await assetChannel.getChannelState(TIMESTAMP);
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
