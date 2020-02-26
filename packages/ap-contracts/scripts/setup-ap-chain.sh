#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

ganache_port=8545

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

# throw if port is already in use
# deploy deterministically
echo "Starting new ganache-cli instance."
npx --quiet ganache-cli -p "$ganache_port" -i 1994 -e 5000000000 -d -m "helmet copy pause hood gun soon fork drum educate curious despair embrace" 1>/dev/null &
ganache_pid=$!

sleep 1

npx --quiet truffle compile
npx --quiet truffle migrate --network ap-chain

echo "✓ ready"

while true; do sleep 1; done
