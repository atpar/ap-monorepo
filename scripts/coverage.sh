(
  cd ./packages/ap-contracts
  yarn coverage
  # cat coverage/lcov.info | coveralls
)

(
  cd ./packages/actus-solidity
  yarn coverage
  # cat coverage/lcov.info | coveralls
)

./node_modules/.bin/lcov-result-merger 'packages/*/coverage/lcov.info' | ./node_modules/.bin/coveralls

