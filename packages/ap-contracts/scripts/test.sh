#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

ganache_port=8545

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

if ! nc -z localhost 8545 
then
  echo "Starting new ganache-cli instance."

  ganache-cli \
  --port "$ganache_port" \
  --networkId "1994" \
  --gasPrice "8000000" \
  --gasLimit "8000000" \
  --time "2009-01-03T18:15:05" \
  --defaultBalanceEther "5000000000" \
  --deterministic --mnemonic "helmet copy pause hood gun soon fork drum educate curious despair embrace" \
  1>/dev/null &

  ganache_pid=$!
fi

if [ ! -d "build" ]
then
	# echo "• compiling ap-contracts"
	truffle compile | 1>/dev/null
fi

truffle test "$@"
