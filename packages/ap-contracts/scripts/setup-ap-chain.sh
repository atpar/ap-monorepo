#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

ganache_port=8545

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

echo "Starting new ganache-cli instance."
npx --quiet ganache-cli \
  --port "$ganache_port" \
  --networkId "1994" \
  --gasLimit "8000000" \
  --defaultBalanceEther "5000000000" \
  --deterministic --mnemonic "helmet copy pause hood gun soon fork drum educate curious despair embrace" \
  1>/dev/null &

ganache_pid=$!

sleep 1

npx --quiet truffle compile
npx --quiet truffle migrate --network ap-chain

echo "✓ ready"

while true; do sleep 1; done
