#!/usr/bin/env bash
# Usage:
# $ deploy-contracts.sh <network [--terminate-on-rejections]>

set -o errexit

export flag=$(mktemp);
trap "rm -rf ${flag}" EXIT

network="${1}"
grep -Eq '^(ap\-chain|goerli|kovan|rinkeby|ropsten)$' <<< "${network}" || {
  echo "ERROR: unexpected network (${network:-unspecified})"
  exit 1
}

# by default, run migration once (do not restart if failed)
_restart=
tags="migrate"
if [ "$2" == "--restart" ]; then
  # restart migration if an unhandled rejection occurs
  _restart=yes
  tags="migrate-terminate"
fi

echo "Deploying to ${network} ..."
while test -f "${flag}"; do

  node --max-old-space-size=4096 node_modules/.bin/buidler deploy \
    --network "${network}" \
    --tags "${tags}" \
    --write true \
  && {
    echo "DONE successfully"
    exit 0
  }

 [ -z "${_restart}" ] && {
    echo "[!] FAILED"
    exit 1
 }

  echo "failed. running again ..."
  sleep 10
done
