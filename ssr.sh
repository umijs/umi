#! /bin/bash
tnpm i 

lerna bootstrap --npm-client=tnpm

tnpm run build

cd packages/umi

tnpm i

tnpm link

cd ../umi-build-dev

tnpm i

tnpm link

cd ../umi-plugin-react

tnpm i

tnpm link

cd ../umi-utils

tnpm i

tnpm link

cd ../af-webpack

tnpm i

tnpm link


cd ../../examples/ssr-koa

tnpm i

tnpm link umi umi-build-dev umi-plugin-react umi-utils  af-webpack
