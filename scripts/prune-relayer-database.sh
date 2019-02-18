#!/bin/sh

echo "clearing database ..."

(
	cd packages/simple-relayer
	echo "" > Database.json
)

