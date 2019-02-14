---
sidebarDepth: 2
---

# Configuration

## Basic

### plugins

* Type: `Array`
* Default: `[]`

Specify the plugins.

The array item is the path to the plugin and can be an npm dependency, a relative path, or an absolute path. If it is a relative path, it will be resolved from the project root directory. such as:

```js
export default {
  plugins: [
    // npm dependency
    'umi-plugin-react',
    // relative path
    './plugin',
    // absolute path
    `${__dirname}/plugin.js`,
  ],
};
```

If the plugin has parameters, it is configured as an array. The first item is the path and the second item is the parameter, similar to how the babel plugin is configured. such as:

```js
export default {
  plugins: [
    // 有参数
    ['umi-plugin-react', {
      dva: true,
      antd: true,
    }],
    './plugin',
  ],
};
```

### routes

* Type: `Array`
* Default: `null`

Configure routing.

umi 的路由基于 [react-router](https://reacttraining.com/react-router/web/guides/quick-start) 实现，配置和 react-router@4 基本一致，详见[路由配置](../guide/router.html)章节。

Umi's routing is based on [react-router](https://reacttraining.com/react-router/web/guides/quick-start), and the configuration is basically the same as react-router@4. Checkout [Routing Configuration](. ./guide/router.html) chapter for details.

```js
export default {
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [
        { path: '/user', redirect: '/user/login' },
        { path: '/user/login', redirect: './user/login' },
      ],
    },
  ],
};
```

Notice:

1. The component file is resolved from the `src/pages` directory.
2. If `routes` is configured, then the configuration route will be used first, and the convension route will not take effect.

### disableRedirectHoist

* Type:`Boolean`
* Default: `false`

For some reason, we hoist all redirect when parsing the route config, but this caused some problems, so add this configuration to disable redirect hoist.

```js
export default {
  disableRedirectHoist: true,
};
```

### history

* Type: `String`
* Default: `browser`

Specify the history type, including `browser`, `hash` and `memory`.

e.g.

```js
export default {
  history: 'hash',
};
```

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

### cssPublicPath <Badge text="2.2.5+"/>

* Type: `String`
* Default: same as `publicPath`

Specify an extra publicPath for CSS.

### mountElementId

* Type: `String`
* Default: `root`

Specifies the mount point id which the react app will mount to.

### minimizer

* Type: `String`
* Default: `uglifyjs`
* Options: `uglifyjs|terserjs`

Which minimizer to use. UglifyJS does not support es6 while [terser](https://github.com/terser-js/terser) does.

### hash

* Type: `Boolean`
* Default: `false`

Whether to enable the hash file suffix.

### targets <Badge text="2.1.0+"/>

* Type: `Object`
* Default: `{ chrome: 49, firefox: 45, safari: 10, edge: 13, ios: 10 }`

Configuring the minimum version of browsers you want to compatible with, umi will automatically introduce polyfill and transform grammar. Configuration items will be merged to default values, so there is no need to give any duplicate configuration.

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

### mock.exclude <Badge text="2.4.5+"/>

- Type: `Array` of `String`
- Default: `[]`

Exclude files that are not mock files in the `mock` directory.

e.g. exclue all files and directorys starts with `_`,

```js
export default {
  mock: {
    exclude: [
      'mock/**/_*.js',
      'mock/_*/**/*.js',
    ],
  }
}
```

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

### treeShaking <Badge text="2.4.0+"/>

- Type: `Boolean`
- Default: `false`

Configure whether to enable treeShaking, which is off by default.

e.g.

```js
export default {
  treeShaking: true,
};
```

For example, after [ant-design-pro opens tree-shaking](https://github.com/ant-design/ant-design-pro/pull/3350), the size after gzip can be reduced by 10K.

### define

Passed to the code via the webpack's DefinePlugin , the value is automatically handled by `JSON.stringify`.
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

### devServer

Configure the [devServer](https://webpack.js.org/configuration/resolve/#devserver) property of webpack.

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

After configuration, asset-manifest.json will be generated and the option will be passed to [https://www.npmjs.com/package/webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin).
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

### autoprefixer <Badge text="2.4.3+"/>

Configuration for [autoprefixer](https://github.com/postcss/autoprefixer#options) .

- Type: `Object`
- Default: `{ browserslist, flexbox: 'no-2019' }`

If you want to be compatible with older versions of iOS Safari's flexbox, try to configure `flexbox: true`.

### uglifyJSOptions

Configuration for [uglifyjs-webpack-plugin@1.x](https://github.com/webpack-contrib/uglifyjs-webpack-plugin/tree/version-1) .

- Type: `Object` | `Function`
- Default: [af-webpack/src/getConfig/uglifyOptions.js](https://github.com/umijs/umi/blob/master/packages/af-webpack/src/getConfig/uglifyOptions.js#L6)

If the value is `Object`，it will be shallow merged.

e.g.

```js
export default {
  uglifyJSOptions: {
    parallel: false,
  },
};
```

If you want to modify the deep configuration, you can use the `Function` style.

e.g.

```js
export default {
  uglifyJSOptions(opts) {
    opts.compress.warning = true;
    return opts;
  },
};
```

### browserslist <Badge text="deprecated"/>

Configure [browserslist](https://github.com/ai/browserslist) to work with babel-preset-env and autoprefixer.

e.g.

```js
export default {
  browserslist: [
    '> 1%',
    'last 2 versions',
  ],
};
```
