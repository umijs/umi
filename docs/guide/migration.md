# 从 umi 1.x 迁移

## 配置文件

* 不再支持 `webpack.config.js`，改为配置 chainWebpack 实现
* 不再支持 `webpackrc.js`，复制到 .umirc.js 里即可

## 配置项

* 不再支持 `hd`，如需开启，装载插件 `umi-plugin-react` 并配置 `hd: {}`
* 不再支持 `disableServiceWorker`，默认不开启，如需开启，装载插件 `umi-plugin-react` 并配置 `pwa: {}`
* 不再支持 `preact`，如需配置，装载插件 `umi-plugin-react` 并配置 `library: 'preact'`
* 不再支持 `loading`，如需配置，装载插件 `umi-plugin-react` 并配置 `dynamicImport.loadingComponent`
* `hashHistory: true` 变更为 `history: 'hash'`
* 不再支持 `disableDynamicImport`，默认不开启，如需开启，装载插件 `umi-plugin-react` 并配置 `dynamicImport: {}`
* 不再支持 `disableFastClick`，默认不开启，如需开启，装载插件 `umi-plugin-react` 并配置 `fastClick: {}`
* 不再支持 `pages`，改为直接配在路由上
* 不再支持 `disableHash`，默认不开启，如需开启，配置 `hash: true`

## 环境变量

* 不再支持 PUBLIC_PATH，通过配置 publicPath 实现
* 不再支持 BASE_URL，通过配置 base 实现
* 不再支持 COMPILE_ON_DEMAND，umi@2 里没有这个功能了
* 不再支持 TSLINT，umi@2 里没有这个功能了
* 不再支持 ESLINT，umi@2 里没有这个功能了

## antd

## umi/dynamic

## 依赖

umi-plugin-* -> umi-plugin-react


