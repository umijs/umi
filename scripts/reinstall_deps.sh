#!/usr/bin/env bash

# Clean
rm -rf node_modules yarn.lock
npx lerna clean -y
find ./packages -type f -name "yarn.lock" -exec rm -rf {} \;

# Install deps
yarn
yarn bootstrap
