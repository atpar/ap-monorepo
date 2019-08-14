#!/bin/sh

trap "exit" INT TERM
trap "printf '\nshutdown ...\n' && kill 0" EXIT

echo "• running ganache-cli"

{ 
	npx --quiet ganache-cli@v6.5.0 -i 1994 -t "2009-01-03T18:15:05" -e 5000000000 -d -m "helmet copy pause hood gun soon fork drum educate curious despair embrace"
} 1>/dev/null &

sleep 1

if [ ! -d "packages/ap-contracts/build" ]
then
	echo "• compiling contracts"
	(
		cd packages/ap-contracts
		npx --quiet truffle@v5.0.28 compile --all | 1>/dev/null
	)
fi

echo "• migrating contracts"

(
	cd packages/ap-contracts
	npx --quiet truffle@v5.0.28 migrate --reset --network development | 1>/dev/null
)

echo "✓ ready"

while true; do sleep 1; done
