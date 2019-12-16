cd ./packages/ap-contracts
yarn coverage
cat coverage/lcov.info | coveralls

