# mfsu（Module Federation Speed Up）

版本要求：3.5+

## 什么是 mfsu

mfsu 是一种基于 webpack5 新特性 Module Federation 的打包提速方案。

假设我们的应用为 A。mfsu 构建一个暴露所有依赖的虚拟应用 B，然后预先构建 B。然后 A 使用 B 中预先编译好的依赖。从而节省了 A 的编译时间，达到编译提速的效果。

## 提速效果

以 antd-pro 初始化项目为例：

### dev 阶段

![基准测试](https://img.alicdn.com/imgextra/i1/O1CN01HwndzM1Y9pc4X1iFK_!!6000000003017-55-tps-1000-376.svg)

![大依赖场景](https://img.alicdn.com/imgextra/i1/O1CN01Kq9Omc1uWCVJx9QaT_!!6000000006044-55-tps-1000-376.svg)

启用 mfsu 后，冷启动速度少量增加。热启动和热更新速度得到了极大提升，尤其在依赖数量增多时。

### build 阶段

![构建测试](https://img.alicdn.com/imgextra/i3/O1CN01OCwtuh1U2j0N4vTUU_!!6000000002460-55-tps-500-376.svg)

由于 mfsu 全量编译依赖，首次构建速度较慢。建议在本地环境将预构建完成，并将产物同步到 git，这样在服务器部署的时间将会压缩到 5s 左右！

> 由于尚未增加对 dumi 的支持，本次测试去除了 `@umijs/preset-dumi`
>
> 由于设备性能不稳定，测试可能存在部分误差

## 开始

1. 初始化一个 umi 应用。
2. 在 config.ts 中添加 `webpack5:{}`,`dynamicImport:{}` 和 `mfsu:{}`。
3. `umi dev` 启动项目。

## 特性

### dev 模式

- 启用 mfsu 后，在项目启动前，会先执行 mfsu 的预编译。
- mfsu 将会监听 package.json 中的 dependencies 和 peerDependencies 变动，并且对依赖进行 diff。如果项目增加了依赖或者改变了依赖版本，将会引起依赖的重新预编译。同时，为了更轻快的研发体验，如果项目仅减少依赖，将不会进行重新编译。
- umi 对 mfsu 的依赖进行了强缓存，刷新浏览器将不会引起对依赖的重新请求。
- 可以通过配置，将预编译的依赖同步到 git，在其他人同步项目时，也可以减少对依赖的编译。
- 得益于依赖的预编译，启动和热更新时，仅对项目文件进行重新编译，使研发流程极度轻松。

### prod 模式

> warning: 由于预编译依赖无法实现 tree-shaking，不建议在打包大小敏感的项目中启用生产模式。

- 在执行 `umi build` 时，将会开始产出 mfsu 预编译依赖，随后将产物合并到 umi 的输出目录中。
- 同样，再次执行 `build` 时，mfsu 将会与之前的产物 diff，如果依赖没有变动，则不再进行 mfsu 预编译。
- 随着项目趋于稳定，依赖的添加变少。使用 mfsu 的 prod 模式可以极快地加快生产构建过程。

## 我正确开启了 mfsu 吗？

为了 mfsu 发挥最好的效果，全部的依赖都应当进行预编译。

由于 mfsu 目前仅支持处理静态 import 语句引入的依赖，其他方式（例如 require 和 await import）引入的依赖无法覆盖到。如果某个库中使用了其他引入语句，会导致 mfsu 无法发挥最好的性能，例如 `@umijs/preset-dumi`。

另一方面，一部分依赖由 umi 的 plugin 引入，但是未在 package.json 中包含，导致没有被 mfsu 覆盖。

因此，需要检查项目依赖是否被 mfsu 完全覆盖。我们可以借助 umi 自带的 webpack-analyze 进行依赖分析。

- `ANALYZE=1 umi dev`启动项目，检查是否正常启动。如果遇到问题，可以提 issue 或者检查下方常见问题。
- 检查是否存在从 `./node_modules` 加载的依赖。如果没有，说明项目依赖以及都被 mfsu 覆盖。
- 如果还存在，请将这个依赖添加到配置中：`mfsu:{ includes: [...] }`。

## 在 antd-pro 中使用

在默认的 antd-pro 中启用 mfsu，需要添加以下配置：

```js
mfsu: {
  includes: [
    'rc-util/es/hooks/useMergedState',
    'swagger-ui-react',
    'moment',
    'moment/locale/*',
    'events',
    'lodash',
    '@ant-design/pro-layout/es/PageLoading',
    'antd/es/locale/*',
    'querystring',
  ],
  redirect: {
    '@umijs/plugin-request/lib/ui': {
      message: 'antd',
      notification: 'antd',
    },
  },
},
```

同时，因为 `dumi` 还没有兼容，需要移除 `@umijs/preset-dumi`。

## 额外的配置说明

- 在 includes 中，可以通过 `moment/locale/*` 来模糊预编译所有相关依赖，例如：`moment/locale/zhCn`。但是实际的国际化场景中，并不需要进行全部的国际化处理。因此，这是一种不推荐的写法，需要针对自己的项目需求，添加对应的国际化包。

## 常见问题

### 多实例问题

#### 问题来源

以 `React` 为例。在开启 mfsu 后，项目中的文件将会经过 `@umijs/import-to-await-require-plugin` 处理：

```ts
// 编写的代码
import React from 'react';

// 处理后的代码
const { default: React } = await import('mf/react');
```

但是部分库没有使用 ES Module 的方式引入，例如使用 require 引入：

```js
// 库代码
const React = require('react');
```

这样的代码无法被插件正确识别，导致库中使用的 React 和代码中不是同一个实例。这样，React 的 hooks 机制将无法正确执行。导致报出 `Invalid hook call. Hooks can only be called inside of the body of a function component ` 的错误。

同样，在部分库中，导出了一些 hooks，但是并没有被正确识别，例如 `rc-util`:

```js
import useMergedState from 'rc-util/es/hooks/useMergedState';
```

因为 `rc-util` 并没有总的出口文件，导致这个依赖没有被正确编译，所以也产生了多个实例。

多实例的问题一方面可能导致项目无法正确运行。一方面因为这个库使用了 React，导致 React 仍然会走普通编译，这样 mfsu 就没法发挥自身的效果。

#### 解决办法

在配置中，mfsu 实现了以下配置：

```js
{
  mfsu: {
    includes: ['rc-util/es/hooks/useMergedState'],
  }
}
```

这样，就会把这个引入添加到预编译中，并且提供入口，解决了多实例的问题。

其他相关的一些依赖 alias，也可以放在 appDepInfo 中，mfsu 在启动时会读取这个配置。

> 如果要进行深度依赖引入，请从`es`而非`lib`目录引入。

### umi 的动态 plugin

#### 问题来源

umi 的 plugin 机制会生成一系列的 .umi/plugin-xxx 文件，这些文件定义了 umi 的导出。umi 不能被 mfsu 预编译。

但是 umi 中也存在一些静态的导出，例如 `react-router-dom` 中的 `Link`。在应用中，常见的使用方法为：

```js
import { Link } from 'umi';
// 实际上编译后
var { Link } = __webpack_require__('./node_module/react-router-dom');

// 但是 router 为
var { BrowserRouter: Router } = await import('mf/react-router-dom');
```

但是由于 Link 需要使用 Router 的 Context，而 Router 为 mfsu 预编译后的版本。导致 Link 没有找到正确的 Context，导致错误。

本质来说，这还是一个多实例问题。

#### 解决办法

在配置中，mfsu 实现了以下配置：

```js
{
  mfsu: {
    redirect: {
      // 将 umi 的 Link 导出重定向到 'react-router-dom'
      umi : {
        Link : 'react-router-dom',
      }
    }
  }
}
```

所以，编写的代码将会编译为：

```js
import umi, { Link } from 'umi';

// 编译后
import umi from 'umi';
import { Link } from 'react-router-dom';
```

这样，就能保证依赖的正确导入。
