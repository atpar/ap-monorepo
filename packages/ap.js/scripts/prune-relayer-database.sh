#!/bin/sh

(
	cd ../../packages/simple-relayer
	echo "" > Channel-Database.json
	echo "" > Orderbook-Database.json
)

echo "cleared relayer databases."
