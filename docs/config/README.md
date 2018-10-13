---
sidebarDepth: 2
---

# Configuration

## Basic

### plugins

* Type: `Array`
* Default: `[]`

Specify the plugin.

such as:

```js
export default {
  plugins: [
    'umi-plugin-react',
    // When the plugin has parameters, it is an array, and the second item of the array is a parameter, similar to the babel plugin.
    ['umi-plugin-react', {
      dva: true,
    }],
  ],
};
```

### routes

* Type: `Array`
* Default: `null`

Configure routing.

::: tip reminder
If `routes` is configured, the negotiated route will not take effect.
:::

### disableRedirectHoist

* 类型：`Boolean`
* 默认值：`false`

For some reason, we hoist all redirect when parsing the route config, but this caused some problems, so add this configuration to disable redirect hoist.

### history

* Type: `String`
* Default: `browser`

To switch the history mode to hash (the default is browser history), configure `history: 'hash'`.

### outputPath

* Type: `String`
* Default: `./dist`

Specifies the output path.

### base

* Type: `String`
* Default: `/`

Specify the base of the react-router to be configured when deploying to a non-root directory.

### publicPath

* Type: `String`
* Default: `/`

Specifies the publicPath of the webpack, pointing to the path where the static resource file is located.

### runtimePublicPath

* Type: `Boolean`
* Default: `false`

Use the `window.publicPath` specified in the HTML when the value is `true`.

### mountElementId

* Type: `String`
* Default: `root`

Specifies the mount point id which the react app will mount to.

### hash

* Type: `Boolean`
* Default: `false`

Whether to enable the hash file suffix.

### targets <Badge text="2.1.0+"/>

* Type: `Object`
* Default: `{ chrome: 49, firefox: 45, safari: 10, edge: 13, ios: 10 }`

配置浏览器最低版本，会自动引入 polyfill 和做语法转换，配置的 targets 会和合并到默认值，所以不需要重复配置。

Configuring the minimum version of browsers you want to compatible with.

e.g. Compatible with ie 11,

```js
export default {
  targets: {
    ie: 11,
  },
};
```

### context

* Type: `Object`
* Default: `{}`

Configuring a global context will override the context in each page.

### exportStatic

* Type: `Boolean | Object`
* Default: `false`

If set to `true` or `Object`, all routes are exported as static pages, otherwise only one index.html is output by default.

such as:

```
"exportStatic": {}
```

### exportStatic.htmlSuffix

* Type: `Boolean`
* Default: `false`

Enable the `.html` suffix.

### exportStatic.dynamicRoot

* Type: `Boolean`
* Default: `false`

Deploy to any path.

### singular

* Type: `Boolean`
* Default: `false`

If set to `true`, enable the directory for singular mode.

* src/layout/index.js
* src/page
* model (if umi-plugin-dva plugin is enabled)

## webpack

### chainWebpack

Extend or modify the webpack configuration via the API of [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain).

such as:

```js
chainWebpack(config, { webpack }) {
  // Set alias
  config.resolve.alias.set('a', 'path/to/a');
  
  // Delete progress bar plugin
  config.plugins.delete('progress');
}
```

### theme

The configuration theme is actually equipped with the less variable. Support for both object and string types, the string needs to point to a file that returns the configuration.
such as:

```
"theme": {
  "@primary-color": "#1DA57A"
}
```

or,

```
"theme": "./theme-config.js"
```

### define

Passed to the code via the webP's DefinePlugin , the value is automatically handled by `JSON.stringify`.
such as:

```js
"define": {
  "process.env.TEST": 1,
  "USE_COMMA": 2,
}
```

### externals

Configure the [externals](https://webpack.js.org/configuration/externals/) property of webpack.
such as:

```js
// Configure react and react-dom do not enter the code
"externals": {
  "react": "window.React",
  "react-dom": "window.ReactDOM"
}
```

### alias

Configure the [resolve.alias](https://webpack.js.org/configuration/resolve/#resolve-alias) property of webpack.

### browserslist

Configure [browserslist](https://github.com/ai/browserslist) to work with babel-preset-env and autoprefixer.
such as:

```js
"browserslist": [
  "> 1%",
  "last 2 versions"
]
```

### devtool

Configure the [devtool](https://webpack.js.org/configuration/devtool/) property of webpack.

### disableCSSModules

Disable [CSS Modules](https://github.com/css-modules/css-modules).

### disableCSSSourceMap

Disable SourceMap generation for CSS.

### extraBabelPresets

Define an additional babel preset list in the form of an array.

### extraBabelPlugins

Define an additional babel plugin list in the form of an array.

### extraBabelIncludes

Define a list of additional files that need to be babel converted, in the form of an array, and the array item is [webpack#Condition](https://webpack.js.org/configuration/module/#condition).

### extraPostCSSPlugins

Define additional PostCSS plugins in the format of an array.

### cssModulesExcludes

The files in the specified project directory do not go css modules, the format is an array, and the items must be css or less files.

### copy

Define a list of files that need to be copied simply. The format is an array. The format of the item refers to the configuration of [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin).

such as:

```markup
"copy": [
  {
    "from": "",
    "to": ""
  }
]
```

### proxy

Configure the [proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy) property of webpack-dev-server.
If you want to proxy requests to other servers, you can do this:

```markup
"proxy": {
  "/api": {
    "target": "http://jsonplaceholder.typicode.com/",
    "changeOrigin": true,
    "pathRewrite": { "^/api" : "" }
  }
}
```

Then visit `/api/users` to access the data of [http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users).

### sass

Configure options for [node-sass](https://github.com/sass/node-sass#options). Note: The node-sass and sass-loader dependencies need to be installed in the project directory when using sass.

### manifest

After configuration, manifest.json will be generated and the option will be passed to [https://www.npmjs.com/package/webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin).
such as:

```markup
"manifest": {
  "basePath": "/app/"
}
```

### ignoreMomentLocale

Ignore the locale file for moment to reduce the size.

### lessLoaderOptions

Additional configuration items for [less-loader](https://github.com/webpack-contrib/less-loader).

### cssLoaderOptions

Additional configuration items for [css-loader](https://github.com/webpack-contrib/css-loader).Configure the [resolve.alias](https://webpack.js.org/configuration/resolve/#resolve-alias) property of webpack.

### browserslist

Configure [browserslist](https://github.com/ai/browserslist) to work with babel-preset-env and autoprefixer.
such as:

```js
"browserslist": [
  "> 1%",
  "last 2 versions"
]
```

### devtool

Configure the [devtool](https://webpack.js.org/configuration/devtool/) property of webpack.

### disableCSSModules

Disable [CSS Modules](https://github.com/css-modules/css-modules).

### disableCSSSourceMap

Disable SourceMap generation for CSS.

### extraBabelPresets

Define an additional babel preset list in the form of an array.

### extraBabelPlugins

Define an additional babel plugin list in the form of an array.

### extraBabelIncludes

Define a list of additional files that need to be babel converted, in the form of an array, and the array item is [webpack#Condition](https://webpack.js.org/configuration/module/#condition).

### extraPostCSSPlugins

Define additional PostCSS plugins in the format of an array.

### cssModulesExcludes

The files in the specified project directory do not go css modules, the format is an array, and the items must be css or less files.

### copy

Define a list of files that need to be copied simply. The format is an array. The format of the item refers to the configuration of [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin).

such as:

```markup
"copy": [
  {
    "from": "",
    "to": ""
  }
]
```

### proxy

Configure the [proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy) property of webpack-dev-server.
If you want to proxy requests to other servers, you can do this:

```markup
"proxy": {
  "/api": {
    "target": "http://jsonplaceholder.typicode.com/",
    "changeOrigin": true,
    "pathRewrite": { "^/api" : "" }
  }
}
```

Then visit `/api/users` to access the data of [http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users).

### sass

Configure options for [node-sass](https://github.com/sass/node-sass#options). Note: The node-sass and sass-loader dependencies need to be installed in the project directory when using sass.

### manifest

After configuration, manifest.json will be generated and the option will be passed to [https://www.npmjs.com/package/webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin).
such as:

```markup
"manifest": {
  "basePath": "/app/"
}
```

### ignoreMomentLocale

Ignore the locale file for moment to reduce the size.

### lessLoaderOptions

Additional configuration items for [less-loader](https://github.com/webpack-contrib/less-loader).

### cssLoaderOptions

Additional configuration items for [css-loader](https://github.com/webpack-contrib/css-loader).
