# mfsu（Module Federation Speed Up）

版本要求：3.5+

## 什么是 mfsu

mfsu 是一种基于 webpack5 新特性 Module Federation 的打包提速方案。核心原理是将应用的依赖构建为一个 Module Federation 的 remote 应用，以免去应用热更新时对依赖的编译。

因此，开启 mfsu 可以大幅减少热更新所需的时间。在生产模式，也可以通过提前编译依赖，大幅增加部署效率。

<!-- ## 提速效果

以 antd-pro 初始化项目为例：

### dev 阶段

![基准测试](https://img.alicdn.com/imgextra/i1/O1CN01HwndzM1Y9pc4X1iFK_!!6000000003017-55-tps-1000-376.svg)

![大依赖场景](https://img.alicdn.com/imgextra/i1/O1CN01Kq9Omc1uWCVJx9QaT_!!6000000006044-55-tps-1000-376.svg)

启用 mfsu 后，冷启动速度少量增加。热启动和热更新速度得到了极大提升，尤其在依赖数量增多时。

### build 阶段

![构建测试](https://img.alicdn.com/imgextra/i3/O1CN01OCwtuh1U2j0N4vTUU_!!6000000002460-55-tps-500-376.svg)

由于 mfsu 全量编译依赖，首次构建速度较慢。建议在本地环境将预构建完成，并将产物同步到 git，这样在服务器部署的时间将会压缩到 5s 左右！

> 由于设备性能不稳定，测试可能存在部分误差 -->

## 使用

### 开发阶段

1. 初始化一个 umi 应用。
2. 在 config.ts 中添加 `webpack5:{}`,`dynamicImport:{}` 和 `mfsu:{}`。
3. `umi dev` 启动项目。在构建依赖时，会出现 MFSU 的进度条，此时应用可能会被挂起或显示依赖不存在，请稍等。
4. 多人合作时，可以配置 `mfsu.development.output` 配置预编译依赖输出目录并添加到 git 中，在其他开发者启动时，就可以免去再次编译依赖的过程。

#### 特性

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
