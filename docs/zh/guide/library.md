---
sidebarDepth: 2
---
# 组件库

## 为什么

组件库的开发需要大量繁琐的配置来搭建开发环境，生成文档站，打包部署。同时，由于 javascript 技术栈迭代太快，要开发一个至少不落伍的包更需要大量学习和选型。

所以为了解决这个痛点，我们将积累的经验和探索的成果进行总结，开发了这个插件，旨在方便更多的开发者进行组件库的开发。如果你在使用中有感到不便，欢迎提 [issue](https://github.com/umijs/umi-plugin-library/issues)。🤓

另外，这里提到的组件库，不仅包含类似 antd 这样的 react 组件库，也可以是 umi-request 这样的工具库。

## 特性

- ✔︎ 提供开箱即用的组件 (component) 和库 (library) 开发脚手架
- ✔︎ 基于 docz + umi，提供一个可以快速开始的组件开发环境
- ✔︎ 支持 mdx 语法，可以在 markdown 里写 jsx，可以很方便的组织组件 demo 与 API 文档
- ✔︎ 打包基于 rollup，专注于组件与库的打包，良好的 tree-shaking 特性可以让你的包更小，不用插件也能支持按需加载
- ✔︎ 支持 cjs，esm，umd 三种格式，让你的包可以适用于各种应用场景
- ✔︎ cjs 和 esm 格式支持 rollup 和 babel 两种打包方式
- ✔︎ 支持 lerna 多包管理方式，允许分包独立发布
- ✔︎ 支持 TypeScript

## 使用

```bash
$ # 创建目录
$ mkdir my-lib && cd my-lib

# 初始化脚手架，选择 library
$ yarn create umi

# 安装依赖
$ yarn install

# 开发
$ umi doc dev

# 打包库
$ umi lib build [--watch]

# 打包文档
$ umi doc build

# 部署文档到 username.github.io/repo
$ umi doc deploy
```

## 配置

Config it in `.umirc.js` or `config/config.js`,

```js
export default {
  plugins: [
      ['umi-plugin-library', {}]
  ],
};
```

## [配置参数](/zh/config/#组件库)

## 教程

- [开发一个组件库](/zh/guide/library-step-by-step.html)

## 常见问题

### 使用 Typescript

`umi-plugin-library` 会检查项目下是否存在 `tsconfig.json`，自动识别不需要额外配置。

推荐开发者使用 `Typescript`, 用 `PropsTable` 可以很方便的自动生成 api 说明。

```js
import { Playground, PropsTable } from 'docz'
import Button from './'

# Button

<PropsTable of={Button} />
```

### mdx 问题

#### [语法](https://mdxjs.com/syntax)

#### 如何使用变量

在某些场景下需要定义变量，不能直接 `const hello = 123`, 需要通过以下几种方式：

- 定义时添加 `export`，如 `export const hello = 123`。
- 将组件演示代码抽出成一个文件如 `demo.jsx`，引入并直接渲染，示例代码可以用 markdown 的方式展示。
- 在 `Playground` 中使用 function 的方式渲染组件。

```jsx
<Playground>
  {
    () => {
      const hello = 123;
      return <div>{hello}</div>;
    }
  }
</Playground>
```

#### 如何使用 state

如果示例组件需要使用 state，需要将代码抽出成一个文件如 `demo.jsx`, 引入并渲染，示例代码可以用 markdown 的方式展示。

### 分包

如果你使用 `lerna` 管理类似 `react`、`babel`、`umi` 这样的分包项目，`umi-plugin-library` 会根据项目下的 `lerna.json` 自动识别。

根目录配置会应用于每个包，如果某个包需要单独配置，可以在包里新建 `.umirc.library.js` 配置差异项即可。注意这个配置文件请使用 es5 语法 `module.exports = {}`。
