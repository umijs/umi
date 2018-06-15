---
sidebarDepth: 2
---

# 配置

## 基本配置

### plugins

指定插件，格式为数组。

比如：

```
export default {
  plugins: [
    'umi-plugin-dva',
    // 有参数时为数组，数组的第二项是参数，类似 babel 插件
    ['umi-plugin-routes', {
      update() {},
    }],
  ],
};
```

### hd

是否开启高清方案，默认为 `false` 。

### disableServiceWorker

禁用 service worker 缓存，默认开启。

### preact

是否切换到 preact，默认为 `false`。

### loading

指定页面切换时的 loading 效果组件，默认为空组件。格式为字符串，指向 loading 组件所在的文件。

比如：

```js
export default {
  loading: './PageLoadingComponent',
};
```

### hashHistory

启用 hash history 的方式。

### singular

启用单数目录，格式为布尔值。

* src/layout/index.js
* src/page
* model（如果有开启 umi-plugin-dva 插件的话）

### disableDynamicImport

禁用 Code Splitting，格式为布尔值。

### disableFastClick

禁用 fastclick 脚本引入，格式为布尔值。

## 构建流程

### outputPath

指定输出路径，默认是 `./dist`。

### pages

配置每个页面的属性。

比如：

```
pages: {
  '/index': { context: { title: 'IndexPage' } },
  '/list':  { document: './list.ejs', context: { title: 'ListPage' } },
},
```

有两个属性：

1. document，指定模板
2. context，指定模板里的变量，比如标题之类的

### context

配置全局 context，会覆盖到每个 pages 里的 context。

### exportStatic

是否导出全部路由为静态页面，默认只输出一个 index.html。

比如：

```
"exportStatic": {}
```

还可以启用 `.html` 后缀。

```
"exportStatic": { htmlSuffix: true },
```

### disableHash

构建输出的文件名不带 hash 值。

## webpack

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

### publicPath
配置 webpack 的 [output.publicPath](https://webpack.js.org/configuration/output/#output-publicpath) 属性。

### outputPath
配置 webpack 的?[output.path](https://webpack.js.org/configuration/output/#output-path)?属性。

### devtool
配置 webpack 的 [devtool](https://webpack.js.org/configuration/devtool/) 属性。

### commons

配置 webpack 的 [CommonsChunkPlugin](https://webpack.js.org/plugins/commons-chunk-plugin/) 插件，格式为数组，有几项配几个 CommonsChunkPlugin 。

比如：

```markup
"commons": [
  {
    async: '__common',
    children: true,
    minChunks(module, count) {
      if (pageCount <= 2) {
        return count >= pageCount;
      }
      return count >= pageCount * 0.5;
    },
  },
]
```

### html

配置 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 插件。

比如：

```markup
"html": {
  "template": "./src/index.ejs"
}
```

### disableCSSModules

禁用 [CSS Modules](https://github.com/css-modules/css-modules)。

### disableCSSSourceMap

禁用 CSS 的 SourceMap 生成。

### extraBabelPresets

定义额外的 babel preset 列表，格式为数组。

### extraBabelPlugins

定义额外的 babel plugin 列表，格式为数组。

### extraBabelIncludes

定义额外需要做 babel 转换的文件匹配列表，格式为数组。

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

### disableDynamicImport

禁用 `import()` 按需加载，全部打包在一个文件里，通过 [babel-plugin-dynamic-import-node-sync](https://github.com/seeden/babel-plugin-dynamic-import-node-sync) 实现。

### es5ImcompatibleVersions

让 babel 自动编译使用了 es6 语法的 npm 模块，[为什么会有这个配置？](https://github.com/sorrycc/blog/issues/68)。

### lessLoaderOptions

给 [less-loader](https://github.com/webpack-contrib/less-loader) 的额外配置项。 

### cssLoaderOptions

给 [css-loader](https://github.com/webpack-contrib/css-loader) 的额外配置项。

### env

针对特定的环境进行配置。dev 的环境变量是?`development`，build 的环境变量是?`production`。
比如：

```js
"extraBabelPlugins": ["transform-runtime"],
"env": {
  "development": {
    "extraBabelPlugins": ["dva-hmr"]
  }
}
```

这样，开发环境下的 extraBabelPlugins 是 `["transform-runtime", "dva-hmr"]`，而生产环境下是 `["transform-runtime"]`。
