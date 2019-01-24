# HTML 模板

## 修改默认模板

新建 `src/pages/document.ejs`，umi 约定如果这个文件存在，会作为默认模板，内容上需要保证有 `<div id="root"></div>`，比如：

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

模板里可通过 `context` 来获取到 umi 提供的变量，context 包含：

* `route`，路由对象，包含 path、component 等
* `config`，用户配置信息
* `publicPath`<Badge text="2.1.2+"/>，webpack 的 `output.publicPath` 配置
* `env`，环境变量，值为 development 或 production
* 其他在路由上通过 context 扩展的配置信息

模板基于 ejs 渲染，可以参考 [https://github.com/mde/ejs](https://github.com/mde/ejs) 查看具体使用。

比如输出变量，

```html
<link rel="icon" type="image/x-icon" href="<%= context.publicPath %>favicon.png" />
```

比如条件判断，

```html
<% if(context.env === 'production') { %>
  <h2>生产环境</h2>
<% } else {%>
  <h2>开发环境</h2>
<% } %>
```

## 针对特定页面指定模板

::: warning
此功能需开启 `exportStatic` 配置，否则只会输出一个 html 文件。
:::

::: tip
优先级是：路由的 document 属性 > src/pages/document.ejs > umi 内置模板
:::

配置路由的 document 属性。

比如约定式路由可通过注释扩展 `document` 属性，路径从项目根目录开始找，

```js
/**
 * document: ./src/documents/404.ejs
 */
```

然后这个路由就会以 `./src/documents/404.ejs` 为模板输出 HTML。
