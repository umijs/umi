import { Message } from 'umi';

# 独立使用 MFSU

`MFSU` 支持独立在非 umijs 项目中使用，本文将会介绍如何将 `MFSU` 接入你的 webpack 项目。

## 示例项目

如何接入 MFSU ？提供以下几个 示例项目 配置供参考：

Webpack 配置示例：<a href="https://github.com/umijs/umi-next/tree/master/examples/mfsu-independent" target="_blank">examples/mfsu-independent</a>

CRA v5 配置示例：<a href="https://github.com/umijs/cra-v5-with-mfsu-example" target="_blank">cra-v5-with-mfsu-example</a>

## 安装

首先安装 `mfsu` 的依赖：

```bash
  pnpm add -D @umijs/mfsu
```

## 配置 MFSU

配置 MFSU 一共需要简单的四步操作，请确保以下所有行为都只在开发环境生效。

### 1. 初始化实例

第一步，初始化一个 `MFSU` 实例，这是 `MFSU` 的基础：

```js
// webpack.config.js

const { MFSU } = require('@umijs/mfsu')
const webpack = require('webpack')

// [mfsu] 1. init instance
const mfsu = new MFSU({
  implementor: webpack,
  buildDepWithESBuild: true,
});
```

### 2. 添加中间件

第二步，添加 `MFSU` 的 `devServer` 中间件到 webpack-dev-server 中，他将为你提供 `MFSU` 所需打包后的资源：

#### webpack 5

```js
// webpack.config.js

module.exports = {
  devServer: {
    // [mfsu] 2. add mfsu middleware
    setupMiddlewares(middlewares, devServer) {
      middlewares.unshift(
        ...mfsu.getMiddlewares()
      )
      return middlewares
    },
  }
}
```

#### webpack 4

```js
// webpack.config.js

module.exports = {
  devServer: {
    // [mfsu] 2. add mfsu middleware
    onBeforeSetupMiddleware(devServer) {
      for (const middleware of mfsu.getMiddlewares()) {
        devServer.app.use(middleware);
      }
    }
  }
}
```

### 3. 配置转换器

第三步，你需要配置一种源码转换器，他的作用是用来收集、转换依赖导入路径，替换为 `MFSU` 的模块联邦地址（中间件所提供的）。

此处提供两种方案：`babel plugins` 或 `esbuild handler` ，一般情况下选择 `babel plugins` 即可。 

#### Babel Plugins

向 `babel-loader` 添加 `MFSU` 的 `babel plugins` 即可。

```js
// webpack.config.js

module.exports = {
  module: {
    rules: [
      // handle javascript source loader
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              // [mfsu] 3. add mfsu babel plugins
              ...mfsu.getBabelPlugins()
            ]
          }
        }
      }
    ]
  }
}
```

#### Esbuild handler

另一种方案是使用内置提供的 `esbuild-loader` 来处理 `js/ts` 资源，**仅用于开发环境** 。

<Message type='success' emoji="🚀">
<strong>使用这种方案的好处是</strong>：在开发环境获得比 `babel` 更快的编译和启动速度
</Message>

```js
// webpack.config.js

const { esbuildLoader } = require('@umijs/mfsu')
const esbuild = require('esbuild')

module.exports = {
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: esbuildLoader,
          options: {
            handler: [
              // [mfsu] 3. add mfsu esbuild loader handlers
              ...mfsu.getEsbuildLoaderHandler()
            ],
            target: 'esnext',
            implementation: esbuild
          }
        }
      }
    ]
  }
}
```

<Message type='warning' emoji="💡">
<strong>什么时候我不应该使用 esbuild 方案？</strong><br />1. 我有自定义的 `babel plugins` 必须在开发环境使用<br />2. 我需要显示 `css-in-js` 的开发环境友好类名（一般由 babel plugin 提供支持）<br />3. 在开发环境多适配一套 `esbuild-loader` 的成本大于配置 `babel plugins` 的成本 
</Message>


### 4. 设定 webpack 配置

第四步，调用 `MFSU` 提供的方法改变你的 webpack 配置，在这里只有增量行为，你无需担心会影响到你原来的配置内容。

如下代码所示，`mfsu.setWebpackConfig` 是一个异步方法，为了调用他你需要将原来的 webpack 配置单独抽为一个对象 `config` 之后，再将调用此方法的返回值导出。

```js
// webpack.config.js

const config = {
  // origin webpack config
}

// [mfsu] 4. inject mfsu webpack config
const getConfig = async () => {
  await mfsu.setWebpackConfig({
    config,
  });
  return config
}

module.exports = getConfig()
```

到此为止，`MFSU` 完全配置完毕，下面可以开始启动项目使用。

## 使用

进行完 4 步配置后，启动你的项目，你可以从项目根目录得到 `.mfsu` 文件夹，即 `MFSU` 缓存文件夹，请将其添加到 git 的忽略列表（这些缓存文件你不应该提交他们）：

```bash
# .gitignore

.mfsu
```

符合预期时，你已经可以享受 `MFSU` 带来的好处，包括 `esbuild` 快速的打包和二次热启动的提速。

## 其他配置

以下是其他你可能会用到的 `MFSU` 实例配置：

```js
  const mfsu = new MFSU({
    cwd: process.cwd()
  })
```

Options:

 - `cwd` (Default: `process.cwd()`): 项目根目录
 - `getCacheDependency` (Default: `() => {}`): 用返回值来对比，使 MFSU cache 无效的函数
 - `tmpBase` (Default: `${process.cwd()}/.mfsu`): MFSU 缓存存放目录
 - `unMatchLibs` (Default: `[]`): 手动排除某些不需要被 MFSU 处理的依赖
 - `runtimePublicPath` (Default: `undefined`): 同 umijs > [`runtimePublicPath`](https://umijs.org/config#runtimepublicpath)
 - `implementor` (Default: `undefined`): webpack 实例，需要和项目内使用的唯一实例一致
 - `buildDepWithESBuild` (Default: `false`): 是否使用 `esbuild` 打包依赖


## 常见问题

#### 如何保证我的 MFSU 配置只在开发环境生效？

使用环境标识避免所有 `MFSU` 在生产环境构建时的配置侵入：

```js
const isDev = process.env.NODE_ENV === 'development'

const mfsu = isDev
  ? new MFSU({
      implementor: webpack,
      buildDepWithESBuild: true,
    }) 
  : undefined

// e.g.
{
  test: /\.[jt]sx?$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      plugins: [
        ...(isDev ? [] : mfsu.getBabelPlugins())
      ]
    }
  }
}
```



