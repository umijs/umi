---
sidebarDepth: 2
---

# Configuration

## Basic

### plugins

- Type: `Array`
- Default: `[]`

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
    [
      'umi-plugin-react',
      {
        dva: true,
        antd: true,
      },
    ],
    './plugin',
  ],
};
```

### routes

- Type: `Array`
- Default: `null`

Configure routing.

Umi's routing is based on [react-router](https://reacttraining.com/react-router/web/guides/quick-start), and the configuration is basically the same as react-router@4. Checkout [Routing Configuration](../guide/router.html) chapter for details.

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

- Type:`Boolean`
- Default: `false`

For some reason, we hoist all redirect when parsing the route config, but this caused some problems, so add this configuration to disable redirect hoist.

```js
export default {
  disableRedirectHoist: true,
};
```

### history

- Type: `String | [String, Object]`
- Default: `browser`

Specify the history type, including `browser`, `hash` and `memory`.

e.g.

```js
export default {
  history: 'hash',
};
```

### outputPath

- Type: `String`
- Default: `./dist`

Specifies the output path.

### base

- Type: `String`
- Default: `/`

Specify the base of the react-router to be configured when deploying to a non-root directory.

### publicPath

- Type: `String`
- Default: `/`

Specifies the publicPath of the webpack, pointing to the path where the static resource file is located.

### runtimePublicPath

- Type: `Boolean`
- Default: `false`

Use the `window.publicPath` specified in the HTML when the value is `true`.

### cssPublicPath <Badge text="2.2.5+"/>

- Type: `String`
- Default: same as `publicPath`

Specify an extra publicPath for CSS.

### mountElementId

- Type: `String`
- Default: `root`

Specifies the mount point id which the react app will mount to.

### minimizer

- Type: `String`
- Default: `uglifyjs`
- Options: `uglifyjs|terserjs`

Which minimizer to use. UglifyJS does not support es6 while [terser](https://github.com/terser-js/terser) does.

### hash

- Type: `Boolean`
- Default: `false`

Whether to enable the hash file suffix.

### targets <Badge text="2.1.0+"/>

- Type: `Object`
- Default: `{ chrome: 49, firefox: 45, safari: 10, edge: 13, ios: 10 }`

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

- Type: `Object`
- Default: `{}`

Configuring a global context will override the context in each page.

### exportStatic

- Type: `Boolean | Object`
- Default: `false`

If set to `true` or `Object`, all routes are exported as static pages, otherwise only one index.html is output by default.

such as:

```
"exportStatic": {}
```

### exportStatic.htmlSuffix

- Type: `Boolean`
- Default: `false`

Enable the `.html` suffix.

### exportStatic.dynamicRoot

- Type: `Boolean`
- Default: `false`

Deploy to any path.

### singular

- Type: `Boolean`
- Default: `false`

If set to `true`, enable the directory for singular mode.

- src/layout/index.js
- src/page
- model (if umi-plugin-dva plugin is enabled)

### mock.exclude <Badge text="2.4.5+"/>

- Type: `Array` of `String`
- Default: `[]`

Exclude files that are not mock files in the `mock` directory.

e.g. exclue all files and directorys starts with `_`,

```js
export default {
  mock: {
    exclude: ['mock/**/_*.js', 'mock/_*/**/*.js'],
  },
};
```

### block <Badge text="2.7.0+"/>

- Type: `Object`
- Default: `{ defaultGitUrl: "https://github.com/umijs/umi-blocks" }`

```js
export default {
  block: {
    defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
    npmClient: 'cnpm',
  },
};
```

### ssr <Badge text="beta" type="warn"/> <Badge text="2.8.0+"/>

- Type: `Boolean | Object`
- Default: `false`

Configure whether to enable Server-Side Render, which is off by default.

When enabled, `umi.server.js` and `ssr-client-mainifest.json` files are also generated when the client static file is generated.

```js
export default {
  ssr: {
    // https://github.com/liady/webpack-node-externals#optionswhitelist-
    externalWhitelist: [],
    // disable ssr external, build all modules in `umi.server.js`
    disableExternal: false,
    // client chunkMaps manifest, default: ssr-client-mainifest.json
    manifestFileName: 'ssr-client-mainifest.json',
  },
};
```

`ssr-client-mainifest.json` is a resource mapping file by routing level, for example:

```json
{
  "/": {
    "js": [
      "umi.6791e2ab.js",
      "vendors.aed9ac63.async.js",
      "layouts__index.12df59f1.async.js",
      "p__index.c2bcd95d.async.js"
    ],
    "css": [
      "umi.baa67d11.css",
      "vendors.431f0bf4.chunk.css",
      "layouts__index.0ab34177.chunk.css",
      "p__index.1353f910.chunk.css"
    ]
  },
  "/news/:id": {
    "js": [
      "umi.6791e2ab.js",
      "vendors.aed9ac63.async.js",
      "layouts__index.12df59f1.async.js",
      "p__news__$id.204a3fac.async.js"
    ],
    "css": ["umi.baa67d11.css", "vendors.431f0bf4.chunk.css", "layouts__index.0ab34177.chunk.css"]
  }
}
```

Use the following in Node.js:

```js
// Return the rendered html fragment according to the ctx.req.url
/**
 *
 * @param {*}
 * ctx (server context, `serverRender` get current active route according to `ctx.req.url`)
 * @return html fragment string
 */
async function UmiServerRender(ctx) {
  // mock a window object
  global.window = {};
  // require module
  const serverRender = require('./dist/umi.server');
  // export react-dom/server to avoid React hooks ssr error
  const { ReactDOMServer } = serverRender;

  const {
    // Current root container element
    rootContainer,
    // page template
    htmlElement,
    // match router path, like /user/:id
    matchPath,
    // initial store data when you use dva
    g_initialData,
  } = await serverRender.default(ctx);

  // Render the element into html
  const ssrHtml = ReactDOMServer.renderToString(htmlElement);
  return ssrHtml;
}
```

Page Data Pre-Fetching:

```js
// pages/news/$id.jsx
const News = props => {
  const { id, name, count } = props || {};

  return (
    <div>
      <p>
        {id}-{name}
      </p>
    </div>
  );
};

/**
 *
 * @param {*}
 * {
 *  route (current active route)
 *  store (need enable `dva: true`, return the Promise via `store.dispatch()` )
 *  isServer (whether run in Server)
 *  req (HTTP server Request object, only exist in Server)
 *  res (HTTP server Response object, only exist in Server)
 * }
 */
News.getInitialProps = async ({ route, store, isServer, req, res }) => {
  const { id } = route.params;
  const data = [
    {
      id: 0,
      name: 'zero',
    },
    {
      id: 1,
      name: 'hello',
    },
    {
      id: 2,
      name: 'world',
    },
  ];
  return Promise.resolve(data[id] || data[0]);
};
```

> in data pre-fetching, we can move the method of fetching data using the `componentDidMount` or `React.useEffect` lifecycles into `getInitialProps`.

[using Pre-Rendering](/plugin/umi-plugin-prerender.html), [umi-example-ssr-with-egg](https://github.com/umijs/umi-example-ssr-with-egg)

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

The configuration theme is actually equipped with the less variable. Support for both object and string types, the string needs to point to a file that returns the configuration. such as:

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

Passed to the code via the webpack's DefinePlugin , the value is automatically handled by `JSON.stringify`. such as:

```js
"define": {
  "process.env.TEST": 1,
  "USE_COMMA": 2,
}
```

### externals

Configure the [externals](https://webpack.js.org/configuration/externals/) property of webpack. such as:

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

Such as use the plugin [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport) .

First install the plugin with `npm install postcss-px-to-viewport --save-dev`, then config the option extraPostCSSPlugins.

```js
import pxToViewPort from 'postcss-px-to-viewport';

const config = {
  ...otherConfig,
  extraPostCSSPlugins: [
    pxToViewPort({
      viewportWidth: 375,
      viewportHeight: 667,
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: [],
      minPixelValue: 1,
      mediaQuery: false,
    }),
  ],
};
```

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

Configure the [proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy) property of webpack-dev-server. If you want to proxy requests to other servers, you can do this:

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

After configuration, asset-manifest.json will be generated and the option will be passed to [https://www.npmjs.com/package/webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin). such as:

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
- Default: `{ browsers: DEFAULT_BROWSERS, flexbox: 'no-2019' }`

If you want to be compatible with older versions of iOS Safari's flexbox, try to configure `flexbox: true`.

### uglifyJSOptions

Configuration for [uglifyjs-webpack-plugin@2.x](https://github.com/webpack-contrib/uglifyjs-webpack-plugin/tree/master) .

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
    opts.uglifyOptions.compress.warning = true;
    return opts;
  },
};
```

### browserslist <Badge text="deprecated"/>

Configure [browserslist](https://github.com/ai/browserslist) to work with babel-preset-env and autoprefixer.

e.g.

```js
export default {
  browserslist: ['> 1%', 'last 2 versions'],
};
```
