#!/bin/bash

# clean node_modules and yarn.lock
rm -rf node_modules
rm -rf yarn.lock
npx lerna clean --yes
find ./packages -type f -name "yarn.lock" -exec rm -rf {} \;

# install deps for root dir
yarn

# install deps for packages
yarn bootstrap
