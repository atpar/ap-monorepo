# AP-Helper

Helper service for working with `ap.js`. 
Contains:
- orderbook-relayer
- ether and erc20 sample token faucet
- api for retrieving ACTUS test terms
- api for progress the state of an asset
- api for updating ClaimsToken contracts

## API
- **Order**
  
  `POST /orders` Post an unfilled or filled order to the orderbook

  `GET /orders` Retrieve unfilled orders from the orderbook

- **Resources**

  `GET /terms` Retrieve ACTUS test terms
  
- **Asset**

  `POST /asset/progress` Progress the state of an asset given its assetId and a timestamp
  
- **Tokenization**

  `POST /tokenization/updateClaimsToken` Update funds received of a ClaimsToken contract

- **Faucet**

  `POST /faucet/ether` Request Ether for an address
  
  `POST /faucet/sampleToken` Request ERC20 sample tokens for an address
  
  `GET /faucet/ether` Retrieve the address of the ERC20 sample token

## Usage
Quick start:
```sh
yarn add @atpar/ap-helper

node ./node_modules/@atpar/ap-helper
```

To clear the orderbook and channel message database:
```sh
echo "" > ./node_modules/@atpar/ap-helper/Orderbook-Database.json
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
