(
  cd ./packages/ap-contracts
  yarn coverage
  cat coverage/lcov.info | coveralls
)

(
  cd ./packages/actus-solidity
  yarn coverage
  cat coverage/lcov.info | coveralls
)
