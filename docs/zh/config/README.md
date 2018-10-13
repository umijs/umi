---
sidebarDepth: 2
---

# 配置

## 基本配置

### plugins

* 类型：`Array`
* 默认值：`[]`

指定插件。

比如：

```js
export default {
  plugins: [
    'umi-plugin-react',
    // 插件有参数时为数组，数组的第二项是参数，类似 babel 插件
    ['umi-plugin-react', {
      dva: true,
    }],
  ],
};
```

### routes

* 类型：`Array`
* 默认值：`null`

配置路由。

::: tip 提醒
如果配置了 `routes`，则约定式路由会不生效。
:::

### disableRedirectHoist

* 类型：`Boolean`
* 默认值：`false`

禁用 redirect 上提。

出于一些原因的考虑，我们在处理路由时把所有 redirect 声明提到路由最前面进行匹配，但这导致了一些问题，所以添加了这个配置项，禁用 redirect 上提。

### history

* 类型：`String`
* 默认值：`browser`

如需切换 history 方式为 hash（默认是 browser history），配置 `history: 'hash'`。

### outputPath

* 类型：`String`
* 默认值：`./dist`

指定输出路径。

### base

* 类型：`String`
* 默认值：`/`

指定 react-router 的 base，部署到非根目录时需要配置。

### publicPath

* 类型：`String`
* 默认值：`/`

指定 webpack 的 publicPath，指向静态资源文件所在的路径。

### runtimePublicPath

* 类型：`Boolean`
* 默认值：`false`

值为 `true` 时使用 HTML 里指定的 `window.publicPath`。

### mountElementId

* 类型：`String`
* 默认值：`root`

指定 react app 渲染到的 HTML 元素 id。

### hash

* Type: `Boolean`
* Default: `false`

是否开启 hash 文件后缀。

### targets <Badge text="2.1.0+"/>

* Type: `Object`
* Default: `{ chrome: 49, firefox: 45, safari: 10, edge: 13, ios: 10 }`

配置浏览器最低版本，会自动引入 polyfill 和做语法转换，配置的 targets 会和合并到默认值，所以不需要重复配置。

比如要兼容 ie11，需配置：

```js
export default {
  targets: {
    ie: 11,
  },
};
```

### context

* 类型：`Object`
* 默认值：`{}`

配置全局 context，会覆盖到每个 pages 里的 context。

### exportStatic

* 类型：`Boolean | Object`
* 默认值：`false`

如果设为 `true` 或 `Object`，则导出全部路由为静态页面，否则默认只输出一个 index.html。

比如：

```
"exportStatic": {}
```

### exportStatic.htmlSuffix

* 类型：`Boolean`
* 默认值：`false`

启用 `.html` 后缀。

### exportStatic.dynamicRoot

* 类型：`Boolean`
* 默认值：`false`

部署到任意路径。

### singular

* 类型：`Boolean`
* 默认值：`false`

如果设为 `true`，启用单数模式的目录。

* src/layout/index.js
* src/page
* model（如果有开启 umi-plugin-dva 插件的话）

## webpack

### chainWebpack

通过 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 的 API 扩展或修改 webpack 配置。

比如：

```js
chainWebpack(config, { webpack }) {
  // 设置 alias
  config.resolve.alias.set('a', 'path/to/a');
  
  // 删除进度条插件
  config.plugins.delete('progress');
}
```

### theme

配置主题，实际上是配 less 变量。支持对象和字符串两种类型，字符串需要指向一个返回配置的文件。
比如：

```
"theme": {
  "@primary-color": "#1DA57A"
}
```

或者，

```
"theme": "./theme-config.js"
```

### define

通过 webpack 的 DefinePlugin 传递给代码，值会自动做 `JSON.stringify` 处理。
比如：

```js
"define": {
  "process.env.TEST": 1,
  "USE_COMMA": 2,
}
```

### externals

配置 webpack 的?[externals](https://webpack.js.org/configuration/externals/)?属性。
比如：

```js
// 配置 react 和 react-dom 不打入代码
"externals": {
  "react": "window.React",
  "react-dom": "window.ReactDOM"
}
```

### alias

配置 webpack 的 [resolve.alias](https://webpack.js.org/configuration/resolve/#resolve-alias) 属性。

### browserslist

配置 [browserslist](https://github.com/ai/browserslist)，同时作用于 babel-preset-env 和 autoprefixer。
比如：

```js
"browserslist": [
  "> 1%",
  "last 2 versions"
]
```

### devtool

配置 webpack 的 [devtool](https://webpack.js.org/configuration/devtool/) 属性。

### disableCSSModules

禁用 [CSS Modules](https://github.com/css-modules/css-modules)。

### disableCSSSourceMap

禁用 CSS 的 SourceMap 生成。

### extraBabelPresets

定义额外的 babel preset 列表，格式为数组。

### extraBabelPlugins

定义额外的 babel plugin 列表，格式为数组。

### extraBabelIncludes

定义额外需要做 babel 转换的文件匹配列表，格式为数组，数组项是 [webpack#Condition](https://webpack.js.org/configuration/module/#condition)。

### extraPostCSSPlugins

定义额外的 PostCSS 插件，格式为数组。

### cssModulesExcludes

指定项目目录下的文件不走 css modules，格式为数组，项必须是 css 或 less 文件。

### copy

定义需要单纯做复制的文件列表，格式为数组，项的格式参考 [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin) 的配置。

比如：

```markup
"copy": [
  {
    "from": "",
    "to": ""
  }
]
```

### proxy

配置 webpack-dev-server 的 [proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy) 属性。
如果要代理请求到其他服务器，可以这样配：

```markup
"proxy": {
  "/api": {
    "target": "http://jsonplaceholder.typicode.com/",
    "changeOrigin": true,
    "pathRewrite": { "^/api" : "" }
  }
}
```

然后访问?`/api/users`?就能访问到?[http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users)?的数据。

### sass

配置 [node-sass](https://github.com/sass/node-sass#options) 的选项。注意：使用 sass 时需在项目目录安装 node-sass 和 sass-loader 依赖。

### manifest

配置后会生成 manifest.json，option 传给 [https://www.npmjs.com/package/webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin)。
比如：

```markup
"manifest": {
  "basePath": "/app/"
}
```

### ignoreMomentLocale

忽略 moment 的 locale 文件，用于减少尺寸。

### lessLoaderOptions

给 [less-loader](https://github.com/webpack-contrib/less-loader) 的额外配置项。 

### cssLoaderOptions

给 [css-loader](https://github.com/webpack-contrib/css-loader) 的额外配置项。
