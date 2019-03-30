# AP-Helper

Helper service for working with `ap.js`. 
Contains:
- orderbook-relayer
- channel-relayer
- ether faucet
- api for retrieving ACTUS test terms

## API
- **Order**
  
  `POST /orders` Post an unfilled or filled order to the orderbook

  `GET /orders` Retrieve unfilled orders from the orderbook

- **Channel**

  `POST /contracts` Retrieve contract updates for an address

  `GET /contracts` Post a contract update

- **Resources**

  `GET /terms` Retrieve ACTUS test terms

- **Faucet**

  `POST /faucet` Request Ether for an address

## Usage
Quick start:
```sh
yarn add @atpar/ap-helper

node ./node_modules/@atpar/ap-helper
```

To clear the orderbook and channel message database:
```sh
echo "" > ./node_modules/@atpar/ap-helper/Orderbook-Database.json
echo "" > ./node_modules/@atpar/ap-helper/Channel-Database.json
```

## Development

### Requirements
- NPM (6.2.0)

### Run
1. install dependencies
```sh
# ap-monorepo/ap-helper/
yarn install
yarn build
```

2. start ap-helper
```sh
yarn start
```
