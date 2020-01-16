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
  echo "Starting new ganache-cli instance." # 1231006505
  ganache-cli -p "$ganache_port" --time "2009-01-03T18:15:05" -e 5000000000 1>/dev/null &
  ganache_pid=$!
fi

if [ ! -d "build" ]
then
	# echo "• compiling ap-contracts"
	truffle compile | 1>/dev/null
fi

truffle test "$@"
