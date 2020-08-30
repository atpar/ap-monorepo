#!/usr/bin/env bash

set -o errexit

export flag=$(mktemp);
trap "rm -rf ${flag}" EXIT

network="${1}"
grep -Eq '^(ap\-chain|goerli|kovan|rinkeby|ropsten)$' <<< "${network}" || {
  echo "ERROR: unexpected network (${network:-unspecified})"
  exit 1
}

echo "Deploying to ${network} ..."
while test -f "${flag}"; do
  node --unhandled-rejections=strict --max-old-space-size=4096 node_modules/.bin/buidler deploy \
    --network "${network}" \
    --tags migrate \
    --write true \
  && {
    echo "DONE successfully"
    exit 0
  }

  echo "failed. running again ..."
  sleep 10
done
