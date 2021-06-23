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

> 由于设备性能不稳定，测试可能存在部分误差

## 开始

1. 初始化一个 umi 应用。
2. 在 config.ts 中添加 `webpack5:{}`,`dynamicImport:{}` 和 `mfsu:{}`。
3. `umi dev` 启动项目。

## 特性

### dev 模式

- 启用 mfsu 模式后，在项目启动时，将会分析项目文件，获取全部 import 和 import() 语句引用的依赖。随后对这部分依赖进行预编译，默认的输出目录在 `~/.umi/.mfsu` 下。
- mfsu 将会启动一个 webpack compile server，实时监听项目文件变更，同时开启 webpack cache。在热更新引入依赖时，会重新对依赖进行预编译。
- umi 对 mfsu 的依赖进行了强缓存，刷新浏览器将不会引起对依赖的重新请求。
- 可以通过 `config.mfsu.development.output` 配置，将预编译的依赖同步到 git，在其他人同步项目时，也可以减少对依赖的编译。
- 得益于依赖的预编译，启动和热更新时，仅对项目文件进行重新编译，使研发流程极度轻松。

### prod 模式

> warning: 由于预编译依赖实现了部分的 tree-shaking，不建议在打包大小敏感的项目中启用生产模式。

- 在执行 `umi build` 时，将会开始产出 mfsu 预编译依赖，随后将产物合并到 umi 的输出目录中。
- 同样，再次执行 `build` 时，mfsu 将会与之前的产物 diff，如果依赖没有变动，则不再进行 mfsu 预编译。
- 随着项目趋于稳定，依赖的添加变少。使用 mfsu 的 prod 模式可以极快地加快生产构建过程。

## 我正确开启了 mfsu 吗？

为了 mfsu 发挥最好的效果，全部的依赖都应当进行预编译。

建议首次启动时，检查项目依赖是否被 mfsu 完全覆盖。我们可以借助 umi 自带的 webpack-analyze 进行依赖分析。

- `ANALYZE=1 umi dev`启动项目，检查是否正常启动。如果遇到问题，可以提 issue 或者检查下方常见问题。
- 检查是否存在从 `./node_modules` 加载的依赖。如果没有，说明项目依赖以及都被 mfsu 覆盖。
- 如果还存在，请通过 issue 反馈给我们，我们期待和您一起把 mfsu 变得更好。

## 在 antd-pro 中使用

mfsu 已经完美支持 antd-pro 和 dumi，在默认的 antd-pro 中启用 mfsu，和在其他项目中使用一样简单：

```js
mfsu: {},
```

## 常见问题

### 1. react: Invalid hook call. Hooks can only be called inside of the body of a function component

mfsu 的原理是将 import 和 import() 引入的依赖进行预编译，如果因为一些意料之外的语法，导致项目同时从预编译和`node_modules`同时导出了一份 React，将会产生 React 的多实例问题。

例如：

```js
// file 1
import React from 'react';
// compiled
const { default: React } = await import('react');

// file 2
var React = _interopRequireDefault('react'); // mfsu cannot recognize
```

由于 Hooks 的实现机制，React 将会抛出错误。

在 `ANALYZE=1 umi dev` 启动项目时，可以判断项目是否在 `node_modules` 中引入 React。如果是，需要尝试修改引入语句。

### 2. React-router-dom: You should not use \<Link\> outside a \<Router\>

umi 是一个动态的定义，由一些固定的导出和 plugin 组成，因此无法对 umi 进行预编译。

umi 中存在的例如 react-router-dom 的 `Link` 等静态导出。和上方的问题类似，如果从 react-router-dom 中导出了 `Context` 但是使用了从 node_modules/react-router-dom 中导出的 `Link`，将会产生这个问题。

在 mfsu 的内部，通过一个 babel 插件 `babel-import-redirect-plugin` 将 umi 导出的 `Link` 重定向到了 `react-router-dom` 解决了这个问题。

如果遇到了这个问题，请尝试 `ANALYZE=1 umi dev` 以分析依赖来源。
