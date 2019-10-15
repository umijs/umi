#!/usr/bin/env bash

if [ -d ./pro_site ]
then
  echo "pro_site existed"
  cd ./pro_site
  git pull
  cd ..
else
  git clone https://github.com/ant-design/ant-design-pro --depth=1 ./pro_site
fi

yarn
yarn bootstrap
yarn build
yarn ui:build
cd packages/umi
yarn link
cd ../..
cd pro_site
yarn
yarn link umi
yarn build
yarn functions:build
