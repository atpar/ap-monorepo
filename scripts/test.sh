#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

npx --quiet ganache-cli@v6.5.0 \
	-i 1994 \
	-t "2009-01-03T18:15:05" \
	-e 5000000000 \
	-d -m "helmet copy pause hood gun soon fork drum educate curious despair embrace" \
	1>/dev/null &

ganache_pid=$!
sleep 1

(
	cd packages/ap-contracts
	npx --quiet truffle@v5.0.28 compile --all | 1>/dev/null
)

(
	cd packages/ap-contracts
	npx --quiet truffle@v5.0.28 migrate --reset --network development | 1>/dev/null
)

lerna run test
