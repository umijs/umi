---
id: faq
title: FAQ
---

> 持续补充。

## General

### umi 和 dva 以及 roadhog 是什么关系？

简单来说，

* dva 是数据流
* roadhog 是通用工具
* umi 是框架，包含路由和工具，很多的约定，很多的性能优化，以及开发体验优化

然后，umi 和 roadhog 共用同一个底层 [af-webpack](https://github.com/umijs/umi/tree/master/packages/af-webpack)，他们在功能上有一定重叠，可以说 umi 包含 roadhog，react 项目我会倾向于推荐用 umi。

### 如何引入 polyfill？

先安装依赖，

```bash
$ npm install @babel/polyfill --save
```

新建 `src/global.js`，内容如下：

```js
import '@babel/polyfill';
```

### 如何让编辑器的 eslint 校验生效？

编辑器需要读取 .eslint 和依赖的 eslint bin，所以需要安装相关依赖到项目。

先安装依赖，

```bash
$ npm i eslint@4 eslint-config-umi eslint-plugin-flowtype@2 eslint-plugin-import@2 eslint-plugin-jsx-a11y@5 eslint-plugin-react@7 --save-dev
```

然后新增 `.eslintrc`，内容如下：

```json
{
  "extends": "eslint-config-umi"
}
```

### 如何禁用 dev 和 build 时的 eslint 校验？

```bash
$ ESLINT=none umi dev
$ ESLINT=none umi build
```

## CSS

### 如何禁用 css modules ？

修改 `.webpackrc`:

```json
{
 "disableCSSModules": true
}
```

### 如何使用 sass ？

先安装额外的依赖，

```bash
$ npm i node-sass sass-loader --save
```

然后修改 `.webpackrc`:

```json
{
 "sass": {}
}
```

## Test

### 如何断点调试

确保 node 在 8 以上，然后执行：

```bash
$ node --inspect-brk ./node_modules/.bin/umi test
```

然后在浏览器里打开 chrome://inspect/#devices 进行 inspect 和断点。

## 部署

### build 后访问路由刷新后 404？

几个方案供选择：

* 改用 hashHistory，在 `.umirc.js` 里配 `hashHistory: true`
* 静态化，在 `.umirc.js` 里配 `exportStatic: true`
* 服务端配置路由 fallback 到 index.html
