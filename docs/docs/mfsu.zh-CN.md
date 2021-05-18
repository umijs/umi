# MFSU（Module Federation Speed Up）

## 什么是 mfsu

MFSU 是一种基于 webpack5 新特性 Module Federation 的打包提速方案。

假设我们的应用为 A。mfsu 构建一个暴露所有依赖的虚拟应用 B，然后预先构建 B。然后 A 使用 B 中预先编译好的依赖。从而节省了 A 的编译时间，达到编译提速的效果。

## 提速效果

以 antd-pro 为例：

- 二次启动时：普通启动耗时 `54s`，mfsu 启动耗时 `14s`
- 热更新：普通热更新耗时`1s`,mfsu 热更新耗时 `300ms`

开启 mfsu，可以使应用启动和热更新性能提升三倍左右。

## 在 umi 中的实现方案

- 必须开启 `webpack5` 和 `dynamicImport`。
- 依赖将会构建到 `.umi/.mfsu` 下。可以看到很多 `__umi_mfsu_` 开头的文件。这些就是构建的虚拟应用的预构建的依赖。主要入口为 `__umi_mfsu_remoteEntry.js`。
- 每次应用的 `package.json` 中的 `dependencies` 和 `peerDenpendencies` 变化时，将会触发重新编译。

## 我正确开启了 mfsu 吗？

因为部分库还未兼容 mfsu，导致无法在 mfsu 模式下正常使用，例如 `plugin-dumi`。以及部分依赖可能没有被正确包括，导致没有被 mfsu 覆盖。

因为，需要检查以下项目是否正确开启 mfsu。

- 启动项目，检查是否正常启动。如果遇到问题，可以提 issue 或者检查下方常见问题。
- 打开 Network，检查依赖加载的来源 `Initiator`。
- 依赖将会被 `load_script` 加载，而非 `devScript`。

如果存在部分依赖被 `devScript` 加载，说明该依赖没有被正确覆盖。需要找到这个依赖的名称和引入位置，并且添加到 `addDepInfo` 或者 `extraDeps` 或者 `redirect` 中。

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

但是部分库可能使用了奇怪的姿势：

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
    extraDeps: ['rc-util/es/hooks/useMergedState'],
  }
}
```

这样，就会把这个引入添加到预编译中，并且提供入口，解决了多实例的问题。

其他相关的一些依赖 alias，也可以放在 appDepInfo 中，mfsu 在启动时会读取这个配置。

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
