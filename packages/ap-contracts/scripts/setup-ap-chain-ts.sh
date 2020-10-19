
#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

ganache_port=8545

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

tar -xvzf ./ap-chain/snapshot.tar.gz

echo "Starting new ganache-cli instance with an ap-chain snapshot."
npx --quiet ganache-cli \
  --db "./ap-chain/snapshot" \
  --port "$ganache_port" \
  --networkId "1994" \
  --gasLimit "8000000" \
  --defaultBalanceEther "5000000000" \
  --deterministic --mnemonic "helmet copy pause hood gun soon fork drum educate curious despair embrace" \
  1>/dev/null &

ganache_pid=$!

sleep 1

echo "✓ ready"

if [ -n "$1" ]
	then 
		eval $1
    rm -r ./ap-chain/snapshot/
	else 
		while true; do sleep 1; done
fi