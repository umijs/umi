#!/usr/bin/env bash
npm install
npm run bootstrap
npm run build
npm run ui:build
cd packages/umi
npm run link
cd ../..

if [ -d ./pro_site ]
then
  echo "pro_site existed"
  cd ./pro_site
  git pull
  cd ..
else
  git clone https://github.com/ant-design/ant-design-pro --depth=1 ./pro_site
fi

cd pro_site
rm -rf package-lock.json yarn.lock
npm update
npm run link umi
npm run build
npm run functions:build
