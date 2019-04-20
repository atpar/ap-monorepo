#!/bin/sh

trap "exit" INT TERM
trap "printf '\nshutdown ...\n' && kill 0" EXIT

echo "running ganache-cli ..."

{ 
	ganache-cli -i 1994 -e 5000000000 -d -m "helmet copy pause hood gun soon fork drum educate curious despair embrace"
} 1>/dev/null &

sleep 1

if [ ! -d "packages/ap-contracts/build" ]
then
	echo "compiling contracts ..."
	(
		cd packages/ap-contracts
		truffle compile | 1>/dev/null
	)
fi

echo "migrating contracts ..."

(
	cd packages/ap-contracts
	truffle migrate --reset --network development | 1>/dev/null
)

echo "clearing databases ..."

(
	cd packages/ap-helper
	echo "" > Channel-Database.json
	echo "" > Orderbook-Database.json
)

echo "running ap-helper ..."

if ! [ -x "$(command -v yarn)" ]; then
	{
		cd packages/ap-helper
		npm start
	} 1>/dev/null &
else
	{
		cd packages/ap-helper
		yarn start
	} 1>/dev/null &
fi

echo "ready ..."

while true; do sleep 1; done
