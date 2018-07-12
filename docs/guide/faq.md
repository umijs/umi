# FAQ

::: tip
持续补充中。
:::

[[toc]]

## General

### 是否可用于生产环境？

当然！umi 是公司内（蚂蚁金服）的前端基础框架，已有大量基于 umi 开发的无线和 PC 项目上线。

### 如何引入 polyfill ？

先安装依赖，

```bash
$ npm install @babel/polyfill --save
```

新建 `src/global.js`，内容如下：

```js
import '@babel/polyfill';
```

### 如何动态修改 title ？

可以通过 [react-helmet](https://github.com/nfl/react-helmet) 动态修改 title 。
> 注意：在混合应用中，ios端web容器内，使用react-helmet失效的话，可以尝试使用[react-document-title](https://github.com/gaearon/react-document-title)。

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

## 报错

### this.setDynamic is not a function

不要自己配置 `babel-plugin-transform-runtime`，因为 umi 已内置处理，transform-runtime 处理两边会出现上述问题。

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

### build之后图片丢失？

可能是图片没有正确引用，可以参考一下代码，正确引入图片。

```js
import React from 'react';
import logo from './logo.png'; // 告诉WebPACK这个JS文件使用这个图像

console.log(logo); // logo.84287d09.png

function Header() {
  // 导入图片
  return <img src={logo} alt="Logo" />;
}

export default Header;
```
在css中使用，注意不要使用绝对路径
```css
.Logo {
  background-image: url(./logo.png);
}
```
> 注意：图片大小小于10k，走basement。即不会被拷贝到public文件夹下，而是以base64的资源存在。