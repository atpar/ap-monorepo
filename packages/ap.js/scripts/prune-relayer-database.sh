#!/bin/sh

(
	cd ../../packages/ap-helper
	echo "" > Channel-Database.json
	echo "" > Orderbook-Database.json
)

echo "cleared relayer databases."
