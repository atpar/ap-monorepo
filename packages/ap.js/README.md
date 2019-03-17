# AP.js

AP.js is a typescript implementation of the ACTUS protocol. 
It allows developers to create and manage ACTUS protocol contracts.

## Overview



## Usage

### Setup
Initializing the ACTUS protocol library.
```js
import { AP, Contract } from './ap.js';

const ap = await AP.init(web3, ORDER_RELAYER_URL, CHANNEL_RELAYER_URL?);
```

### Contract
`Contract` enables you to create and manage the lifecycle of an ACTUS contract.

Creating a new Contract
```js
const contract = await Contract.create(ap, CONTRACT_TERMS, CONTRACT_OWNERSHIP);
```
Loading a Contract given its ContractId from the on-chain registries
```js
const contract = await Contract.load(ap, CONTRACT_ID);
```

### Contract Channel
`ContractChannel` enables you to create and manage a Contract Channel (aka Financial State Channel). 
A Contract Channel only stores the minimum amount of information in order to resolve disputes on-chain. 
Consensus upon the current state of an ACTUS contract is solved by requiring each obligor on the record creator and 
counter party side to sign the current contract state. A Contract Channel only stores the initial terms and 
the ownership of the contract on-chain as well as payments made from the obligors to the beneficiaries.
Contract Updates are send through a relayer which hostname has to specified when instantiating `AP.js`. 

Creating a new Contract Channel
```js
const contractChannel = await ContractChannel.create(ap, CONTRACT_TERMS, CONTRACT_OWNERSHIP);
```
Listening for new Contract Channels that where opened by a counter party
```js
ap.onNewContractChannel((contractChannel) => {
  console.log(contractChannel);
});
```
A `ChannelState` describes the action required by the user at a given point in time. A Contract Channel is either:
- `Idle`, if no action is required on both sides (no obligations to fullfill at this point in time),
- `Updatable`, if the users action is required by fullfilling the current obligations and updating the state of the contract,
- `Confirmable`, if the counter party awaits the signature of the user for the next state, or 
- `Receivable`, if action of the counter party is required by fillfilling obligations and updating the state of the contract.
```js
const channelState = await contractChanne.getChannelState(TIMESTAMP);
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
