---
id: html-tpl
title: 配置 HTML 模板
---

## 修改默认模板

新建 `pages/document.ejs`，umi 约定如果这个文件存在，会作为默认模板，内容上可以参考 [umi 内置模板](https://github.com/umijs/umi/blob/master/packages/umi-build-dev/template/document.ejs)，需要保证出现 `<div id="root"></div>`。

## 针对特定页面指定模板

配置 `.umirc.js`

```js
{
  "pages": {
    "/": { document: "./a.ejs" },
    "/list": { document: "./b.ejs" }
  }
}
```

优先级是：pages 里指定 > pages/document.ejs > umi 内置模板。
