#!/usr/bin/env bash

set -o errexit

lerna run test --stream --no-prefix "$@"
