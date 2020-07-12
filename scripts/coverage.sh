mergerd_lconv=$(mktemp)
trap "rm -rf $mergerd_lconv" EXIT

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

#./node_modules/.bin/lcov-result-merger 'packages/*/coverage/lcov.info' > "$mergerd_lconv"
#./node_modules/.bin/coveralls < "$mergerd_lconv"
