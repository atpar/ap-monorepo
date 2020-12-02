#!/usr/bin/env bash

set -o errexit

trap shutdown_ganache EXIT

ganache_port=8545

shutdown_ganache() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

while [[ $# -gt 0 ]]
do
case $1 in
  --eval-and-exit)
  EVAL_CMD="$2"
  shift
  shift
  ;;
  --from-snapshot)
  FROM_SNAPSHOT=YES
  shift
  ;;
  --take-snapshot)
  TAKE_SNAPSHOT=YES
  shift
  ;;
  --no-deploy)
  NO_DEPLOY=YES
  shift
  ;;
  *)
  echo "Unknown argument provided!"
  exit 1
  ;;
esac
done

if [[ -n "$FROM_SNAPSHOT" && -n "$TAKE_SNAPSHOT" ]]; then
  echo "--from-snapshot and --take-snapshot can't be used at the same time!"
  exit 1
fi
if [[ -n "$FROM_SNAPSHOT" && -z "$NO_DEPLOY" ]]; then
  echo "--from-snapshot requires --no-deploy to be set!"
  exit 1
fi
if [[ -n "$TAKE_SNAPSHOT" && -n "$NO_DEPLOY" ]]; then
  echo "--take-snapshot and --no-deploy can't be used at the same time!"
  exit 1
fi

if [[ -n "$FROM_SNAPSHOT" ]]; then
  tar -xzf ap-chain/snapshot.tar.gz
fi

echo "Starting new ganache-cli instance."
npx --quiet ganache-cli \
  --port "$ganache_port" \
  --networkId "1994" \
  --gasLimit "8000000" \
  --defaultBalanceEther "5000000000" \
  --deterministic --mnemonic "helmet copy pause hood gun soon fork drum educate curious despair embrace" \
  `if [[ -n "$FROM_SNAPSHOT" || -n "$TAKE_SNAPSHOT" ]]; then echo --db "./ap-chain/snapshot"; fi` \
  1>/dev/null &

ganache_pid=$!

sleep 1

if [[ -z "$NO_DEPLOY" ]]; then
  npx --quiet hardhat deploy --network ap-chain --tags deploy-ap-chain
fi

if [[ -n "$TAKE_SNAPSHOT" ]]; then
  sleep 3
  tar -zcf ap-chain/snapshot.tar.gz ap-chain/snapshot
  rm -r ap-chain/snapshot
  echo "✓ created snapshot"
  exit 0
fi

echo "✓ ready"

if [[ -n "$EVAL_CMD" ]]
	then
		eval $EVAL_CMD
    if [[ -n "$FROM_SNAPSHOT" ]]; then
      rm -r ap-chain/snapshot/
    fi
	else 
		while true; do sleep 1; done
fi
