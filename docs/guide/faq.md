---
sidebarDepth: 3
---

# FAQ

## General

### 是否可用于生产环境？

当然！umi 是蚂蚁金服的前端基础框架，已有几百个基于 umi 开发的无线和 PC 项目上线。

### 如何引入 @babel/polyfill ？

先安装依赖，

```bash
$ yarn add @babel/polyfill
```

然后新建 `src/global.js`，内容如下：

```js
import '@babel/polyfill';
```

### 如何动态修改 title ？

可以通过 [react-helmet](https://github.com/nfl/react-helmet) 动态修改 title 。
> 注意：在混合应用中，ios端web容器内，使用react-helmet失效的话，可以尝试使用[react-document-title](https://github.com/gaearon/react-document-title)。

## 报错

## CSS

### 如何禁用 css modules ？

修改 `.umirc.js`:

```json
{
 "disableCSSModules": true
}
```

但没有特殊的理由时，不建议关闭 css modules。

### 如何使用 sass ？

先安装额外的依赖，

```bash
$ npm i node-sass sass-loader --save
```

然后修改 `.umirc.js`:

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

* 改用 hashHistory，在 `.umirc.js` 里配 `history: 'hash'`
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

> 注意：图片大小小于 10 k 时会走 base64。即不会被拷贝到 public 文件夹下，而是以 base64 的资源存在。
