---
translateHelp: true
---

# HTML Template


## 修改默认模板

新建 `src/pages/document.ejs`，umi 约定如果这个文件存在，会作为默认模板，比如：

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Your App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

## 配置模板

模板里可通过 context 来获取到 umi 提供的变量，context 包含：

* `route`，路由信息，需要打包出多个静态 HTML 时（即配置了 exportStatic 时）有效
* `config`，用户配置信息

比如：

```html
<link rel="icon" type="image/x-icon" href="<%= context.config.publicPath %>favicon.png" />
```
