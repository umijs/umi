---
nav:
  title: Config
  order: 2
translateHelp: true
toc: menu
---

# Config


The following configuration items are sorted alphabetically.

## alias

* Type: `object`
* Default: `{}`

Configure aliases to implicitly reference paths.

such as:

```js
export default {
  alias: {
    'foo': '/tmp/a/b/foo'
  }
}
```

Then `import('foo')` is actually `import ('/tmp/a/b/foo')`.

Umi has the following aliases built in:

* `@`, Project src directory
* `@@`, A temporary directory, usually the `src/.umi` directory
* `umi`, The current umi repository directory
* `react-router` and `react-router-dom`, The underlying routing library, the locked version, all the places that depend on them use the same version when packaging
* `react` and `react-dom`, The default version is `16.x`, but if there is a dependency in the project, the dependent version in the project will be used first

## analyze

* Type: `object`
* Default: `{}`

Package module structure analysis tool, you can see the size of each module of the project, and optimize it as needed. Open it with `ANALYZE=1 umi build` or` ANALYZE=1 umi dev`. The default server port number is `8888`. More configurations are as follows:

```js
{
  // The specific meaning of the configuration is as follows: https://github.com/umijs/umi-webpack-bundle-analyzer#options-for-plugin
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  }
}
```

## autoprefixer

* Type: `object`
* Default: `{ flexbox: 'no-2009' }`

Set [Configuration of autoprefixer](https://github.com/postcss/autoprefixer#options)。

note:

* Do not set the `overrideBrowserslist`. This configuration is taken over internally. Select the browser you want to be compatible with via the `targets` configuration item.

## base

* Type: `string`
* Default: `/`

Set routing prefix, usually used for deployment to non-root directories.

For example, if you have routes `/` and `/users` and then set base to `/foo/`, then you can access the previous routes through `/foo/` and `/foo/users`.

## chainWebpack

* Type: `Function`

Modify the webpack configuration through the [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) API.

such as:

```js
export default {
  chainWebpack(memo, { env, webpack, createCSSRule }) {
    // Set alias
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');

    // Remove umi built-in
    memo.plugins.delete('progress');
    memo.plugins.delete('friendly-error');
    memo.plugins.delete('copy');
  }
}
```

The parameters are,

* memo, The current webpack-chain object
* env, Current environment, `development`,` production` or `test` etc.
* webpack, Webpack instance to get its internal plugins
* createCSSRule, To extend other CSS implementations, such as sass, stylus

## chunks

The default is `['umi']`, which can be modified. For example, after vendor dependencies extraction, you need to load `vendors.js` before `umi.js`.

such as:

```js
export default {
  chunks: ['vendors', 'umi']
  chainWebpack: function (config, { webpack }) {
    config.merge({
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test({ resource }) {
                return /[\\/]node_modules[\\/]/.test(resource);
              },
              priority: 10,
            },
          },
        },
      }
    });
  },
}
```

## cssLoader

* Type: `object`
* Default: `{}`

Set [css-loader configuration item](https://github.com/webpack-contrib/css-loader#options).

## cssnano

* Type: `{ mergeRules: false, minifyFontValues: { removeQuotes: false } }`
* Default: `{}`

Set [cssnano configuration item](https://cssnano.co/optimisations/), based on the default configuration collection.

For example: `.box { background: url("./css/../img/cat.jpg"); }` will be compressed into `.box { background: url(img/cat.jpg); }` by default If you don't want this feature, you can set it,

```js
export default {
  cssnano: {
    normalizeUrl: false,
  },
}
```

## copy

* Type: `Array(string)`
* Default: `[]`

Set the file or folder to be copied to the output directory.

For example, your directory structure is as follows,

```js
+ src
  - index.ts
+ bar
  - bar.js
- foo.js
```

Then set,

```js
export default {
  copy: [
    'foo.js',
    'bar',
  ]
}
```

After compiling, the following files will be output additionally.

```js
+ dist
  + bar
    - bar.js
  - foo.js
```

## define

* Type: `object`
* Default: `{}`

Used to provide variables available in the code.

such as:

```js
export default {
  define: {
    FOO: 'bar',
  }
}
```

Then you write `console.log('hello', FOO);` will be compiled into `console.log('hello', 'bar');`.

note:

* The property value of the define object will undergo a JSON.stringify conversion

The built-in define attribute,

* process.env.NODE\_ENV with value `development` or `production`

If you have some code that you don't want to run in the build environment, such as assertion judgment, you can do this,

```js
if (process.env.NODE_ENV === 'development') {
  assert(foo === bar, 'foo is not equal to bar');
}
```

dev runs normally, after build it will become,

```js
if (false) {
  assert(foo === bar, 'foo is not equal to bar');
}
```

It is then compressed and not output in the code of the build environment.

## devServer

* Type: `object`
* Default: `{}`

Configure the development server.

Contains the following sub-configuration items,

* port, Port number, default `8000`
* host, Default `0.0.0.0`
* https, Whether to enable https server
* http2, Whether to enable http2

Enabling port and host can also be temporarily specified through the environment variables PORT and HOST.

## devtool

* Type: `string`
* Default: `cheap-module-source-map` in dev, `false` in build

User configured sourcemap type.

Common optional types are:

* eval, The fastest type, but does not support lower versions of the browser, if the compilation is slow, you can try
* source-map, The slowest and most complete type

For more types, see [webpack # devtool configuration](https://webpack.js.org/configuration/devtool/#devtool).

## dynamicImport

* Type: `object`
* Default: `false`

Whether to enable on-demand loading, that is, whether to split the build product, download additional JS and execute it when needed.

When closed by default, only one js and one css are generated, namely `umi.js` and `umi.css`. The advantage is worry-free and easy to deploy; the disadvantage is that it is slow for users to open the website for the first time.

This is usually the case after packaging,

```bash
+ dist
  - umi.js
  - umi.css
  - index.html
```

After enabling it, you need to consider the configuration of `publicPath`, and possibly `runtimePublicPath`, because you need to know where to asynchronously load resources such as JS, CSS, and images.

This is usually the case after packaging,

```bash
+ dist
  - umi.js
  - umi.css
  - index.html
  - p__index.js
  - p__users__index.js
```

Here `p__users_index.js` is the path where the routing component is located `src/pages/users/index`, where `src` is ignored and `pages` is replaced with `p`.

Contains the following sub-configuration items,

* loading, Type is string, pointing to loading component file

such as:

```js
export default {
  dynamicImport: {
    loading: '@/Loading',
  },
}
```

Then create a new `Loading.tsx` in the src directory,

```jsx
import React from 'react';

export default () => {
  return <div>Loading...</div>;
}
```

After building, you can see the effect using low network simulation.

## exportStatic

* Type: `object`

Configure the output format of html. By default, it only outputs `index.html`.

If `exportStatic` is turned on, html files are output for each route.

Contains two sub-attributes,

* htmlSuffix, enable the `.html` suffix.
* dynamicRoot, deployed to an arbitrary path.

For example the following route,

```bash
/
/users
/list
```

When `exportStatic` is not turned on, output,

```bash
- index.html
```

Output after setting `exportStatic: {}`,

```bash
- index.html
- users/index.html
- list/index.html
```

Output after setting `exportStatic: { htmlSuffix: true }`,

```bash
- index.html
- users.html
- list.html
```

## externals

* Type: `object`
* Default: `{}`

Sets which modules can not be packaged. They are introduced by `<script>` or other methods, and usually need to be used together with scripts or headScripts configuration.

such as,

```js
export default {
  externals: {
    react: 'window.React',
  },
  scripts: [
    'https://unpkg.com/browse/react@16.12.0/umd/react.production.min.js',
  ]
}
```

In simple terms, it can be understood that `import react from 'react'` will be replaced with` const react = window.React`.

## extraBabelPlugins

* Type: `Array`
* Default: `[]`

Configure additional babel plugins.

such as:

```js
export default {
  extraBabelPlugins: [
    'babel-plugin-react-require',
  ],
}
```

## extraBabelPresets

* Type: `Array`
* Default: `[]`

Configure additional babel plugin set.

## extraPostCSSPlugins

* Type: `Array`
* Default: `[]`

Configure additional [postcss plugin](https://github.com/postcss/postcss/blob/master/docs/plugins.md).

## favicon

* Type: `string`

Configure the favicon address (href attribute).

such as,

```js
export default {
  favicon: '/assets/favicon.ico',
}
```

Will be generated in HTML,

```html
<link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.ico" />
```

## forkTSCheker

* Type: `object`

Enable TypeScript compile-time type checking, and turn off by default.

## hash

* Type: `boolean`
* Default: `false`

Configures whether the generated file contains a hash suffix, which is usually used for incremental publishing and to prevent the browser from loading the cache.

When hashing is enabled, the artifact usually looks like this,

```bash
+ dist
  - logo.sw892d.png
  - umi.df723s.js
  - umi.8sd8fw.css
  - index.html
```

Note:

* HTML files always have no hash

## headScripts

* Type: `Array`
* Default: `[]`

Configure additional scripts in `<head>`, array items are strings or objects.

The string format is sufficient in most scenarios, such as:

```js
export default {
  headScripts: [
    `alert(1);`,
    `https://a.com/b.js`,
  ],
}
```

Will generate HTML,

```html
<head>
  <script>alert(1);</script>
  <script src="https://a.com/b.js"></script>
</head>
```

If you want to use extra attributes, you can use the format of the object,

```js
export default {
  headScripts: [
    { src: '/foo.js', defer: true },
    { content: `alert('你好');`, charset: 'utf-8' },
  ],
}
```

Will generate HTML,

```html
<head>
  <script src="/foo.js" defer></script>
  <script charset="utf-8">alert('你好');</script>
</head>
```

## history

* Type: `object`
* Default: `{ type: 'browser' }`

Configure [history type and configuration items](https://github.com/ReactTraining/history/blob/master/docs/GettingStarted.md).

Contains the following sub-configuration items,

* type, optional `browser`,` hash`, and `memory`
* options, configuration items passed to create {{{ type }}} History, each type has different configuration items

note,

* In options, `getUserConfirmation` is not supported because it is a function format.
* In options, `basename` does not need to be configured. It is specified through the `base` configuration of umi.

## ignoreMomentLocale

* Type: `true`
* Default: `false`

Ignore the locale file for moment to reduce the size.

## inlineLimit

* Type: `number`
* Default: `10000` (10k)

Configure whether the image file complies with the base64 compilation threshold. The default is 10000 bytes, less than it will be compiled into base64 encoding, otherwise a separate file will be generated.

## lessLoader

* Type: `object`
* Default: `{}`

Set [less-loader configuration item](https://github.com/webpack-contrib/less-loader).

## links

* Type: `Array`
* Default: `[]`

Configure additional link tags.

## manifest

* Type: `object`

Configure whether you need to generate an additional manifest file that describes the product. By default, `asset-manifest.json` is generated.

Contains the following sub-configuration items,

* fileName, file name, default is `asset-manifest.json`
* publicPath, which will use webpack's `output.publicPath` configuration by default
* basePath, prefix all file paths

note:

* Only generated when `umi build`

## metas

* Type: `Array`
* Default: `[]`

Configure additional meta tags.

## mock

* Type: `object`
* Default: `{}`

Configure mock properties.

Contains the following sub-attributes,

* exclude, in the format `Array(string)`, used to ignore files that do not need to be mocked

## mountElementId

* Type: `string`
* Default: `root`

Specifies the id of the HTML element to which the react app renders.

## outputPath

* Type: `string`
* Default: `dist`

Specify the output path.

note:

* Not allowed to set to `src`, `public`, `pages`, `mock`, `config`, etc.

## plugins

* Type: `Array(string)`
* Default: `[]`

Configure additional umi plugins.

The array items are paths to the plugin, which can be npm dependencies, relative paths, or absolute paths. If it is a relative path, it will start from the project root directory.

```js
export default {
  plugins: [
    // npm dependency
    'umi-plugin-hello',
    // relative path
    './plugin',
    // Absolute path
    `${__dirname}/plugin.js`,
  ],
};
```

Plug-in parameter level configuration item declarations, such as:

```js
export default {
  plugins: [
    'umi-plugin-hello',
  ],
  hello: {
    name: 'foo',
  },
}
```

The configuration item name is usually the plugin name without the `umi-plugin-` or` @ umijs / plugin` prefix.

## postcssLoader

* Type: `object`
* Default: `{}`

Set [postcss-loader configuration item](https://github.com/postcss/postcss-loader#options).

## presets

* Type: `Array(string)`
* Default: `[]`

Same as `plugins` configuration, used to configure additional umi plugin set.

## proxy

* Type: `object`
* Default: `{}`

Configure proxy capabilities.

```
export default {
  proxy: {
    '/api': {
      'target': 'http://jsonplaceholder.typicode.com/',
      'changeOrigin': true,
      'pathRewrite': { '^/api' : '' },
    },
  },
}
```

Then visit `/api/users` to access the data of [http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users).

## publicPath

* Type: `publicPath`
* Default: `/`

Configure publicPath.

## routes

* Type: `Array(route)`

Configure routing.

The routing of umi is based on [react-router@5](https://reacttraining.com/react-router/web/guides/quick-start). The configuration is basically the same as that of `react-router`. For details, see [route configuration](TODO).

such as:

```js
export default {
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/user', redirect: '/user/login' },
        { path: '/user/login', component: './user/login' },
      ],
    },
  ],
};
```

note:

* If the value of `component` is a relative path, it will be resolved based on `src/pages`.
* If `routes` is configured, profiled routing is preferred, and conventional routing will not take effect

## runtimePublicPath

* Type: `boolean`
* Default: `false`

Configures whether the runtime publicPath is enabled.

Usually used for a set of code that has different publicPath requirements in different environments, and then the publicPath is output by the server through the global `window.publicPath` variable of HTML.

When enabled, this paragraph will be added when packaging,

```js
__webpack_public_path__ = window.publicPath;
```

Then when webpack loads resource files such as JS asynchronously, it starts from `window.publicPath`.

## scripts

* Type: `Array`
* Default: `[]`

Same as [headScripts](TODO), configure additional scripts in `<body>`.

## singular

* Type: `boolean`
* Default: `false`

Configure whether to enable directories in singular mode.

For example, the convention of `src/pages` is the `src/page` directory after opening, and the plugins in [@umijs/plugins](https://github.com/umijs/plugins) also follow the conventions of this configuration.

## ssr

Not yet implemented in umi@3.

## styleLoader

* Type: `object`

Enable and set the [style-loader configuration item](https://github.com/webpack-contrib/style-loader), which is used to make CSS inline package in JS without outputting additional CSS files.

## styles

* Type: `Array(string)`
* Default: `[]`

Configure additional CSS.

such as:

```js
export default {
  styles: [
    `body { color: red; }`,
    `https://a.com/b.css`,
  ],
}
```

Will generate HTML,

```html
<head>
  <style>body { color: red; }</style>
  <link rel="stylesheet" href="https://a.com/b.css" />
</head>
```

## targets

* Type: `object`
* Default: `{ chrome: 49, firefox: 64, safari: 10, edge: 13, ios: 10 }`

The configuration requires a compatible minimum version of the browser. Polyfills and syntax conversions are automatically introduced.

For example, to be compatible with ie11, you need to configure:

```js
export default {
  targets: {
    ie: 11,
  },
};
```

note:

* Configured targets will be merged with default values, no need to repeat configuration
* The sub item is configured as `false` to delete the version number of the default configuration

## terserOptions

* Type: `object`
* Default: [terserOptions.ts](https://github.com/umijs/umi/blob/master/packages/bundler-webpack/src/getConfig/terserOptions.ts)

Configure [Configuration Items of Compressor terser](https://github.com/terser/terser#minify-options).

## theme

* Type: `object`
* Default: `{}`

The configuration theme is actually configured with the less variable.

such as:

```js
export default {
  theme: {
    '@primary-color': '#1DA57A',
  },
}
```

## title

* Type: `string`
* Default: `''`

Configure the title.

such as:

```js
export default {
  title: 'hi',
}
```

You can also configure headers for routes, such as,

```js
export default {
  title: 'hi',
  routes: [
    { path: '/', title: 'Home' },
    { path: '/users', title: 'Users' },
    { path: '/foo', },
  ],
}
```

Then we visit `/` with the title `Home`, visit `/users` with the title `Users` and visit `/foo` with the default `hi`.

note:

* By default, `<title>` tags will not be output in HTML, which will be obtained through dynamic rendering.
* `ExportStatic` will output` <title>` tags for each HTML

> It is recommended to use it after building, which is more conducive to application optimization.
