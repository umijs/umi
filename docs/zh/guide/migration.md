# 从 umi 1.x 迁移

> 更喜欢观看视频？可以[点此观看](https://youtu.be/1mvKzFLLBck)。

下面以 [antd-admin](https://github.com/zuiidea/antd-admin/pull/877) 为例，介绍如何从 umi@1 升级到 umi@2 。

## npm 依赖

升级 umi 到 `^2.0.0-0`，并使用 umi-plugin-react 代替以前的众多插件，包含 umi-plugin-dva、umi-plugin-dll、umi-plugin-routes、umi-plugin-polyfill 和 umi-plugin-locale。

```diff
- "umi": "^1.3.17",
+ "umi": "^2.0.0-beta.16",

- "umi-plugin-dll": "^0.2.1",
- "umi-plugin-dva": "^0.9.1",
- "umi-plugin-routes": "^0.1.5"
+ "umi-plugin-react": "^1.0.0-beta.16",
```

umi-plugin-react 是一个包含了十多个插件的集合，详见 [umi-plugin-react 介绍](/zh/plugin/umi-plugin-react.html)。

## 环境变量

umi@2 支持在 `.env` 里配置环境变量，所以之前写在 package.json scripts 里的环境变量可以切到这里。

```diff
- "start": "cross-env COMPILE_ON_DEMAND=none BROWSER=none HOST=0.0.0.0 umi dev",
+ "start": "cross-env BROWSER=none HOST=0.0.0.0 umi dev",
```

然后新建 `.env`，（其中 `COMPILE_ON_DEMAND` 已不再支持）

```
BROWSER=none
HOST=0.0.0.0
```

另外，有些环境变量有变化或不再支持：

* 不再支持 `PUBLIC_PATH`，通过配置 `publicPath` 实现
* 不再支持 `BASE_URL`，通过配置 `base` 实现
* 不再支持 `COMPILE_ON_DEMAND`，umi@2 里没有这个功能了
* 不再支持 `TSLINT`，umi@2 里没有这个功能了
* 不再支持 `ESLINT`，umi@2 里没有这个功能了

## 配置

### 插件配置

由于前面我们把很多插件改成通过 umi-plugin-react 实现，所以需要修改 `.umirc.js`，

```diff
export default {
  plugins: [
-    'umi-plugin-dva',
+    ['umi-plugin-react', {
+      dva: true,
+      antd: true,  // antd 默认不开启，如有使用需自行配置
+    }],
  ],
};
```

更多 dll、hardSource、polyfilles、locale、title 等，参考 [umi-plugin-react 文档](/zh/plugin/umi-plugin-react.html)。

### webpackrc.js

umi@2 不再支持 `webpackrc.js`，把里面的配置原样复制到 `.umirc.js` 即可。

### webpack.config.js

umi@2 不再支持 `webpack.config.js`，改为通过配置 [chainWebpack](/zh/config/#chainwebpack) 实现。

### 详细的配置项变更

* 不再支持 `hd`，如需开启，装载插件 `umi-plugin-react` 并配置 `hd: {}`
* 不再支持 `disableServiceWorker`，默认不开启，如需开启，装载插件 `umi-plugin-react` 并配置 `pwa: {}`
* 不再支持 `preact`，如需配置，装载插件 `umi-plugin-react` 并配置 `library: 'preact'`
* 不再支持 `loading`，如需配置，装载插件 `umi-plugin-react` 并配置 `dynamicImport.loadingComponent`
* `hashHistory: true` 变更为 `history: 'hash'`
* 不再支持 `disableDynamicImport`，默认不开启，如需开启，装载插件 `umi-plugin-react` 并配置 `dynamicImport: {}`
* 不再支持 `disableFastClick`，默认不开启，如需开启，装载插件 `umi-plugin-react` 并配置 `fastClick: {}`
* 不再支持 `pages`，改为直接配在路由上
* 不再支持 `disableHash`，默认不开启，如需开启，配置 `hash: true`

## 约定式路由

路由层不再支持 `page.js` 的目录级路由。之前如果有用，需要把不需要的路由通过 umi-plugin-react 的 routes.exclude 排除掉。

## umi/dynamic

接口变更，umi@2 是基于 [react-loadable](https://github.com/jamiebuilds/react-loadable) 实现的。

```diff
- dynamic(async () => {})
+ dynamic({ loader: async () => {}})
```

详见 [umi/dynamic 接口说明](/zh/api/#umi-dynamic)。
