---
id: faq
title: FAQ
---

> 持续补充。

## ESLint

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
