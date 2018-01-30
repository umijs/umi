---
id: faq
title: FAQ
---

> 持续补充。

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
