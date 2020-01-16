#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

# use id ap-chain Id
ganache-cli \
	-i 1994 \
	-t "2009-01-03T18:15:05" \
	-e 5000000000 \
	-d -m "helmet copy pause hood gun soon fork drum educate curious despair embrace" \
	1>/dev/null &

ganache_pid=$!
sleep 1

# necessary otherwise contracts are not persisted for test cases in ap.js

# echo "• migrating ap-contracts"
(
	cd packages/ap-contracts
	truffle migrate --reset --network development | 1>/dev/null
)

lerna run test --stream --no-prefix
