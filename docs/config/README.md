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

Configure the alias to map the reference path.

such as:

```js
export default {
  alias: {
    'foo': '/tmp/a/b/foo'
  }
}
```

Then `import('foo')` is actually `import('/tmp/a/b/foo')`.

Umi The following aliases are built in：

* `@`, project src directory
* `@@`, temporary directory, usually `src/.umi` directory
* `umi`, the currently running umi warehouse directory
* `react-router` and `react-router-dom`, low-level routing library, locked version, use the same version for all places that depend on them when packaging
* `react` and `react-dom`, use the `16.x` version by default, but if there are dependencies in the project, the dependent version in the project will be used first

## analyze

* Type: `object`
* Default: `{}`

Package module structure analysis tool, you can see the size of each module of the project and optimize it on demand. It is enabled by `ANALYZE=1 umi build` or `ANALYZE=1 umi dev`, the default server port number is `8888`, and more configurations are as follows:

```js
{
  // Please refer to the specific meaning of configuration: https://github.com/umijs/umi-webpack-bundle-analyzer#options-for-plugin
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

Set [autoprefixer configuration items](https://github.com/postcss/autoprefixer#options).

note：

* Don't set `overrideBrowserslist`, this configuration is taken over internally. Use the `targets` configuration item to select the browser you want to be compatible.

## base

* Type: `string`
* Default: `/`

Set the routing prefix, usually used for deployment to non-root directories.

For example, if you have routes `/` and `/users`, and set the base to `/foo/`, then you can access the previous routes through `/foo/` and `/foo/users`.

## chainWebpack

* Type: `Function`

Modify the webpack configuration through the API of [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain).

such as：

```js
export default {
  chainWebpack(memo, { env, webpack, createCSSRule }) {
    // set alias
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');

   // Delete umi built-in plugin
    memo.plugins.delete('progress');
    memo.plugins.delete('friendly-error');
    memo.plugins.delete('copy');
  }
}
```

Support asynchronous，

```js
export default {
  async chainWebpack(memo) {
    await delay(100);
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');
  }
}
```

When SSR, modify the server-side build configuration

```js
import { BundlerConfigType } from 'umi';

export default {
  chainWebpack(memo, { type }) {
    // Modification of ssr bundler config
    if (type === BundlerConfigType.ssr) {
      // Server-side rendering build extension
    }

    // Modification of csr bundler config
    if (type === BundlerConfigType.csr) {
      // Client rendering build extension
    }

    // ssr and csr both extend
  }
}
```

The parameters are:

* memo, the current webpack-chain object
* env, the current environment, `development`, `production` or `test` etc.
* webpack, webpack instance, used to get its internal plug-ins
* createCSSRule, used to extend other CSS implementations, such as sass, stylus
* type, the current webpack instance type, csr is used by default, if ssr is enabled, there will be a webpack instance of ssr

## chunks

The default is `['umi']`, which can be modified. For example, after vendor dependency extraction, you will need to load `vendors.js` before `umi.js`.

such as:

```js
export default {
  chunks: ['vendors','umi'],
  chainWebpack: function (config, {webpack }) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks:'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter:'.',
          cacheGroups: {
            vendor: {
              name:'vendors',
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

If you want to change the ClassName class name into a camel case naming form, you can configure:

```js
{
  cssLoader: {
    localsConvention:'camelCase'
  }
}
```

Then the following wording will be automatically converted to camel case name:

```tsx
import React from'react';

import styles from'./index.less'; // .bar-foo {font-size: 16px;}

export default () => <div className={styles.barFoo}>Hello</div>;
// => <div class="bar-foo___{hash}">Hello</div>
```

## cssModulesTypescriptLoader <Badge>3.1+</Badge>

* type: `{ mode:'verify' |'emit' }`
* Default: `undefined`

For style files such as css or less introduced in the css modules way, ts type definition files are automatically generated.

such as:

```js
export default {
  cssModulesTypescriptLoader: {},
}
```

Equivalent to the following configuration, `mode` defaults to `emit`,

```js
export default {
  cssModulesTypescriptLoader: {
    mode: 'emit',
  },
}
```

## cssnano

* Type: `{ mergeRules: false, minifyFontValues: {removeQuotes: false} }`
* Default: `{}`

Set [cssnano configuration items](https://cssnano.co/optimisations/), based on the default configuration collection.

For example: `.box {background: url("./css/../img/cat.jpg"); }` will be compressed into `.box {background: url(img/cat.jpg); }` , If you don’t want this feature, you can set it,

```js
export default {
  cssnano: {
    normalizeUrl: false,
  },
}
```

## copy

* Type: `Array(string|{from:string,to:string})`
* Default: `[]`

Set the file or folder to be copied to the output directory.

For example, your directory structure is as follows,

```js
+ src
  -index.ts
+ bar
  -bar.js
-foo.js
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

After the compilation is complete, the following files will be additionally output,

```js
+ dist
  + bar
    -bar.js
  -foo.js
```

Support configuration from-to. It should be noted that from is the path relative to cwd, and to is the path relative to the output path.

For example, your directory structure is as follows,

```js
+ src
  -index.ts
+ bar
  -bar.js
```

Then set,

```js
export default {
  copy: [
   {
     from:'bar/bar.js',
     to:'some/bar.js'
   }
  ]
}
```

After the compilation is complete, the following files will be additionally output,

```js
+ dist
  + some
    -bar.js
```

## define

* Type: `object`
* Default: `{}`

Used to provide variables available in the code.

such as:

```js
export default {
  define: {
    FOO:'bar',
  }
}
```

Then you write `console.log(hello, FOO);` which will be compiled into `console.log(hello,'bar')`.

note:

* The attribute value of the define object will undergo a JSON.stringify conversion

The built-in define attribute,

* process.env.NODE\_ENV, the value is `development` or `production`

If you have some code that you don't want to run in the generation environment, such as assertion judgment, you can do this,

```js
if (process.env.NODE_ENV ==='development') {
  assert(foo === bar,'foo is not equal to bar');
}
```

It runs normally during dev, and it becomes as after build,

```js
if (false) {
  assert(foo === bar,'foo is not equal to bar');
}
```

Then it is compressed and not output in the code of the generation environment.

## devServer

* Type: `object`
* Default: `{}`

Configure the development server.

Contains the following sub-configuration items:

* port, port number, default `8000`
* host, default `0.0.0.0`
* https, whether https server is enabled, and HTTP/2 is also enabled
* writeToDisk, generate `assets` to the file system

The enabling port and host can also be specified temporarily through the environment variables PORT and HOST.

## devtool

* Type: `string`
* Default: `cheap-module-source-map` in dev, `false` in build

The user configures the sourcemap type.

Common optional types are:

* eval, the fastest type, but does not support lower version browsers, if the compilation is slow, you can try
* source-map, the slowest and most complete type

For more details, please refer to [webpack#devtool configuration](https://webpack.js.org/configuration/devtool/#devtool).

## dynamicImport

* Type: `object`
* Default: `false`

Whether to enable on-demand loading, that is, whether to split the build product, download additional JS and execute it when needed.

When closed by default, only one js and one css will be generated, namely `umi.js` and `umi.css`. The advantages are worry-free and easy deployment; the disadvantage is that it will be slower for users to open the website for the first time.

It usually looks like this after packaging,

```bash
+ dist
  -umi.js
  -umi.css
  -index.html
```

After enabling, you need to consider the configuration of publicPath, and you may also need to consider runtimePublicPath, because you need to know where to asynchronously load resources such as JS, CSS, and images.

This is usually the case after packaging,

```bash
+ dist
  -umi.js
  -umi.css
  -index.html
  -p__index.js
  -p__users__index.js
```

The `p__users_index.js` here is the path `src/pages/users/index` where the routing component is located, where `src` will be ignored, and `pages` will be replaced with `p`.

Contains the following sub-configuration items,

* loading, the type is a string, pointing to the loading component file

such as:

```js
export default {
  dynamicImport: {
    loading:'@/Loading',
  },
}
```

Then create a new `Loading.tsx` in the src directory,

```jsx
import React from'react';

export default () => {
  return <div>Loading...</div>;
}
```

After construction, use low network simulation to see the effect.

## dynamicImportSyntax

* Type: `object`
* Default: `false`

If you don't need to load routes on demand, but only need to support code splitting with `import()` syntax, use this configuration.

such as:

```js
export default {
  dynamicImportSyntax: {},
}
```

## exportStatic

* Type: `object`

Configure the output format of html, and only output `index.html` by default.

If you need pre-rendering, please enable the [ssr](#ssr-32) configuration, which is commonly used to solve the problem of speeding up the SEO and first-screen rendering of the page without the server.

If you enable `exportStatic`, html files will be output for each route.

Contains the following attributes:

* htmlSuffix, enable the `.html` suffix.
* dynamicRoot, deploy to any path.
* extraRoutePaths, to generate additional route pages, see [Pre-rendering dynamic routing](/zh-CN/docs/ssr#Pre-rendering dynamic routing)

For example, the following route,

```bash
/
/users
/list
```

When `exportStatic` is not turned on, the output is

```bash
-index.html
```

After setting `exportStatic: {}`, output,

```bash
-index.html
-users/index.html
-list/index.html
```

After setting `exportStatic: {htmlSuffix: true }`, output,

```bash
-index.html
-users.html
-list.html
```

If there is [SEO](https://baike.baidu.com/item/%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E%E4%BC%98%E5 %8C%96/3132?fromtitle=SEO&fromid=102990) requirements, you can turn on the [ssr](#ssr) configuration, after `umi build`, it will be routed (except static routes) and rendered into static html pages with specific content , Such as the following routing configuration:

```jsx
// .umirc.ts | config/config.ts
{
  routes: [
    {
      path:'/',
      component:'@/layouts/Layout',
      routes: [
        {path:'/', component:'@/pages/Index' },
        {path:'/bar', component:'@/pages/Bar' },
        {path:'/news', component:'@/pages/News' },
        {path:'/news/:id', component:'@/pages/NewsDetail' },
      ]
    },
  ]
}
```

After setting `{ ssr: {}, exportStatic: {}`, output,

After compilation, the following products are generated:

```bash
-dist
  -umi.js
  -umi.css
  -index.html
  -bar
    -index.html
  -news
    -index.html
    -[id].html
```

Taking into account that after pre-rendering, most of the `umi.server.js` server files will no longer be used, and the `umi.server.js` file will be deleted after the build is completed. If there is a need for debugging and not deleting the server file, you can It is reserved by the environment variable `RM_SERVER_FILE=none`.

## externals

* Type: `object`
* Default: `{}`

Set which modules can not be packaged, and import them through `<script>` or other methods. Usually need to be used together with scripts or headScripts configuration.

such as,

```js
export default {
  externals: {
    react:'window.React',
  },
  scripts: [
    'https://unpkg.com/browse/react@16.12.0/umd/react.production.min.js',
  ]
}
```

In simple understanding, it can be understood that `import react from'react'` will be replaced with `const react = window.React`.

## extraBabelIncludes

* Type: `Array`
* Default: `[]`

Configure additional npm packages or directories that need to be compiled by babel.

such as:

```js
export default {
  extraBabelIncludes: [
    // Support absolute path
    join(__dirname,'../../common'),

    // Support npm package
    'react-monaco-editor',
  ],
}
```

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

Configure an additional set of babel plugins.

## extraPostCSSPlugins

* Type: `Array`
* Default: `[]`

Configure additional [postcss plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md).

## favicon

* Type: `string`

Configure the favicon address (href attribute).

such as,

```js
export default {
  favicon:'/assets/favicon.ico',
}
```

> If you want to use local pictures, please put them in the `public` directory

Will be generated in HTML,

```html
<link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.ico" />
```

## forkTSChecker

* Type: `object`

Enable TypeScript compile-time type checking, which is disabled by default.

## fastRefresh <Badge>3.3+</Badge>

* Type: `object`

Fast refresh (Fast Refresh), you can **keep the component state** during development, and edit to provide **instant feedback**.

[Document](/docs/fast-refresh)

## hash

* Type: `boolean`
* Default: `false`

Configure whether the generated file contains the hash suffix, which is usually used for incremental publishing and to prevent the browser from loading the cache.

After enabling hash, the product usually looks like this,

```bash
+ dist
  -logo.sw892d.png
  -umi.df723s.js
  -umi.8sd8fw.css
  -index.html
```

Note:

* html files never have hash

## headScripts

* Type: `Array`
* Default: `[]`

Configure the extra script in `<head>`, the array items are strings or objects.

In most scenarios, the string format is sufficient, such as:

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

If you want to use additional attributes, you can use the object format,

```js
export default {
  headScripts: [
    {src:'/foo.js', defer: true },
    {content: `alert('你好');`, charset:'utf-8' },
  ],
}
```

Will generate HTML,

```html
<head>
  <script src="/foo.js" defer></script>
  <script charset="utf-8">alert('Hello');</script>
</head>
```

## history

* Type: `object`
* Default: `{ type:'browser' }`

Configure [history type and configuration items](https://github.com/ReactTraining/history/blob/master/docs/GettingStarted.md).

Contains the following sub-configuration items:

* type, optional `browser`, `hash` and `memory`
* options, the configuration items passed to create{{{ type }}}History, the configuration items of each type are different

note,

* In options, `getUserConfirmation` does not support configuration because it is a function format
* In options, `basename` does not need to be configured, it is specified by umi's `base` configuration

## ignoreMomentLocale

* Type: `boolean`
* Default: `false`

Ignore the locale file of moment, which is used to reduce the size.

## inlineLimit

* Type: `number`
* Default: `10000` (10k)

Configure whether the picture file follows the threshold of base64 compilation. The default is 10000 bytes, less than it will be compiled into base64 encoding, otherwise a separate file will be generated.

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

Configure whether you need to generate an additional manifest file to describe the product. By default, `asset-manifest.json` is generated.

Contains the following sub-configuration items:

* fileName, file name, the default is `asset-manifest.json`
* publicPath, the default will use webpack's `output.publicPath` configuration
* basePath, prefix all file paths
* writeToFileEmit, in development mode, write manifest to the file system

note:

* Only generated when `umi build`

## metas

* Type: `Array`
* Default: `[]`

Configure additional meta tags. Objects in the form of `key:value` can be configured in the array.

The final generated meta tag format is: `<meta key1="value1" key2="value2"/>`.

Such as the following configuration:
```js
export default {
  metas:[
    {
      name:'keywords',
      content:'umi, umijs'
    },
    {
      name:'description',
      content:'🍙 Plug-in enterprise-level front-end application framework. '
    },
    {
      bar:'foo',
    },
  ],
}
```

The final generated html tags are:
```html
<meta name="keywords" content="umi, umijs"/>
<meta name="description" content="🍙 Plug-in enterprise-level front-end application framework."/>
<meta bar="foo"/>
```

## mock

* Type: `object`
* Default: `{}`

Configure mock properties.

Contains the following sub-attributes:

* exclude, the format is `Array(string)`, used to ignore files that do not need to be mocked

## mountElementId

* Type: `string`
* Default: `root`

Specify the id of the HTML element rendered by react app.

note:

* If you need to package the application into an umd package for export, you need to set mountElementId to `''`

## mpa <Badge>3.1+</Badge>

* Type: `object`

Switch the rendering mode to mpa.

Contains the following characteristics:

* Output html for each page
* The output does not include react-router, react-router-dom, history and other libraries
* Rendering and url unbinding, html files can be used anywhere

note:

* Only support first level routing configuration
* Does not support layout or nested routing configuration

## nodeModulesTransform <Badge>3.1+</Badge>

* Type: `object`
* Default: `{ type:'all' }`

Set the compilation method of dependent files in the node\_modules directory.

The sub-configuration items include:

* `type`, type, optional `all` and `none`
* `exclude`, ignored dependent libraries, package names, absolute paths are not currently supported

Two compilation modes,

* The default is `all`, all are compiled, and then dependent libraries that do not need to be compiled can be ignored through `exclude`;
* Can be switched to `none`, the default value is compiled [es5-imcompatible-versions](https://github.com/umijs/es5-imcompatible-versions) The dependencies declared in [es5-imcompatible-versions] can be added through the `exclude` configuration to add additional compilation requirements of;

The former is slower but can circumvent common compatibility issues, while the latter is the opposite.

## outputPath

* Type: `string`
* Default: `dist`

Specify the output path.

note:

* It is not allowed to set as the convention directory such as `src`, `public`, `pages`, `mock`, and `config`

## plugins

* Type: `Array(string)`
* Default: `[]`

Configure additional umi plugins.

The array item is the path to the plugin, which can be npm dependency, relative path or absolute path. If it is a relative path, it will start from the project root directory.

```js
export default {
  plugins: [
    // npm dependency
    'umi-plugin-hello',
    // relative path
    './plugin',
    // absolute path
    `${__dirname}/plugin.js`,
  ],
};
```

The parameter level configuration item declaration of the plug-in, such as:

```js
export default {
  plugins: [
    'umi-plugin-hello',
  ],
  hello: {
    name:'foo',
  },
}
```

The name of the configuration item is usually the plug-in name without the `umi-plugin-` or `@umijs/plugin` prefix.

## polyfill

* Type: `{ imports: string[] }`

Set the on-demand introduction of polyfills, corresponding to core-js's [Introduction Range] (https://github.com/zloirock/core-js#commonjs-api), which is fully introduced by default.

Only introduce stable functions:

```
export default {
  polyfill: {
    imports: [
      'core-js/stable',
    ]
  }
}
```

Or introduce on demand:

```
export default {
  polyfill: {
    imports: [
      'core-js/features/promise/try',
      'core-js/proposals/math-extensions'
    ]
  },
}
```

note:

* After setting the `BABEL_POLYFILL=none` environment variable, the configuration becomes invalid and no polyfill is introduced.

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

Configure agent capabilities.

```
export default {
  proxy: {
    '/api': {
      'target':'http://jsonplaceholder.typicode.com/',
      'changeOrigin': true,
      'pathRewrite': {'^/api':'' },
    },
  },
}
```

Then you can access the data of [http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users) by visiting `/api/users`.

> Note: The proxy configuration only takes effect in dev.

## publicPath

* Type: `publicPath`
* Default: `/`

Configure the publicPath of webpack. When packaging, webpack will add the value of `publicPath` in front of the static file path. When you need to modify the static file address, such as using CDN deployment, set the value of `publicPath` to the value of CDN. If you use some special file systems, such as hybrid development or cordova and other technologies, you can try to set `publicPath` to `./` relative path.

> The relative path `./` has some limitations, for example, it does not support multi-layer routing `/foo/bar`, but only supports single-layer path `/foo`

If your application is deployed on a sub-path of the domain name, such as `https://www.your-app.com/foo/`, you need to set the `publicPath` to `/foo/`, if you want to take into account the normal development environment For debugging, you can configure it like this:

```js
import {defineConfig} from'umi';

export default defineConfig({
  publicPath: process.env.NODE_ENV ==='production'?'/foo/':'/'
})
```

## routes

* Type: `Array(route)`

Configure routing.

umi's routing is implemented based on [react-router@5](https://reacttraining.com/react-router/web/guides/quick-start), the configuration is basically the same as that of react-router, see [Routing Configuration](TODO )chapter.

such as:

```js
export default {
  routes: [
    {
      path:'/',
      component:'@/layouts/index',
      routes: [
        {path:'/user', redirect:'/user/login' },
        {path:'/user/login', component:'./user/login' },
      ],
    },
  ],
};
```

note:

* If the value of `component` is a relative path, it will be parsed based on the path `src/pages`
* If `routes` is configured, configuration routing is preferred, and conventional routing will not take effect

## runtimeHistory

* Type: `object`

Whether the configuration needs to dynamically change the history type.

After setting runtimeHistory, you can dynamically modify the history type at runtime.

```js
import {setCreateHistoryOptions} from'umi';

setCreateHistoryOptions({
  type:'memory'
});
```

## runtimePublicPath

* Type: `boolean`
* Default: `false`

Configure whether to enable runtime publicPath.

It is usually used for a set of codes that have different publicPath needs in different environments, and then the publicPath is output by the server through the HTML global variable `window.publicPath`.

After enabling, this paragraph will be added when packaging,

```js
__webpack_public_path__ = window.resourceBaseUrl || window.publicPath;
```

Then webpack will start searching from `window.resourceBaseUrl` or `window.publicPath` when loading resource files such as JS asynchronously.

## ssr <Badge>3.2+</Badge>

* Type: `object`
* Default: `false`

Configure whether to enable server-side rendering, the configuration is as follows:

```js
{
  // One key to open
  ssr: {
    // More configuration
    // forceInitial: false,
    // removeWindowInitialProps: false
    // devServerRender: true,
    // mode:'string',
    // staticMarkup: false,
  }
}
```

Configuration instructions:

* `forceInitial`: Force the implementation of the `getInitialProps` method during client rendering. A common scenario: a static site wants to keep the data up-to-date every time it is accessed.
* `removeWindowInitialProps`: Remove the `window.getInitialProps` variable from HTML to avoid a large amount of data in HTML that will affect the SEO effect, scenario: static site
* `devServerRender`: In the `umi dev` development mode, rendering is performed for rapid development and debugging of umi SSR projects. The rendering effect on the server side is what you see is what you get. At the same time, we consider that it may interact with the server side framework (such as [ Egg.js](https://eggjs.org/), [Express](https://expressjs.com/), [Koa](https://koajs.com/)) combined with local development and debugging, After closing, server-side rendering will not be performed under `umi dev`, but `umi.server.js` (Umi SSR server-side rendering entry file) will be generated, and the rendering development process will be handled by the developer.
* `mode`: Rendering mode. The default is to use `string` string rendering, and it also supports streaming `mode:'stream'` to reduce TTFB (the time it takes for the browser to start receiving server response data).
* `staticMarkup`: Rendering attributes on html (such as `data-reactroot` rendered by React), often used in scenes generated by static sites.

note:

* After opening, when executing `umi dev`, visit http://localhost:8000, and by default the single page application (SPA) will be rendered into html fragments, which can be viewed through the developer tool "Display webpage source code".
* Execute `umi build`, and the product will additionally generate a `umi.server.js` file, which runs on the Node.js server and is used for server-side rendering and rendering html fragments.
* If the application does not have a Node.js server, and you want to generate html fragments for SEO (search engine optimization), you can turn on the [exportStatic](#exportstatic) configuration, which will perform **pre-rendering** when executing the `umi build` .
* `removeWindowInitialProps` and `forceInitial` cannot be used at the same time

To learn more, click [Server Rendering Document](/zh-CN/docs/ssr).

## scripts

* Type: `Array`
* Default: `[]`

Same as [headScripts](#headscripts), configure additional scripts in `<body>`.

## singular

* Type: `boolean`
* Default: `false`

Configure whether to enable the singular mode directory.

For example, the convention of `src/pages` is the `src/page` directory after opening, and the plug-ins in [@umijs/plugins](https://github.com/umijs/plugins) also follow this configuration convention.

## styleLoader

* Type: `object`

Enable and set [style-loader configuration item](https://github.com/webpack-contrib/style-loader) to make CSS inline packaged in JS without outputting additional CSS files.

## styles

* Type: `Array(string)`
* Default: `[]`

Configure additional CSS.

such as:

```js
export default {
  styles: [
    `body {color: red; }`,
    `https://a.com/b.css`,
  ],
}
```

Will generate HTML,

```html
<head>
  <style>body {color: red; }</style>
  <link rel="stylesheet" href="https://a.com/b.css" />
</head>
```

## targets

* Type: `object`
* Default: `{ chrome: 49, firefox: 64, safari: 10, edge: 13, ios: 10 }`

The configuration requires a compatible minimum version of the browser, and polyfills and syntax conversions will be automatically introduced.

For example, to be compatible with ie11, you need to configure:

```js
export default {
  targets: {
    ie: 11,
  },
};
```

note:

* The configured targets will be merged to the default value, no need to repeat configuration
* The sub-item configuration is `false` to delete the version number of the default configuration

## terserOptions

* Type: `object`
* Default: [terserOptions.ts](https://github.com/umijs/umi/blob/master/packages/bundler-webpack/src/getConfig/terserOptions.ts)

Configure [Compressor terser configuration items](https://github.com/terser/terser#minify-options).

## theme

* Type: `object`
* Default: `{}`

Configuring the theme is actually configuring less variables.

such as:

```js
export default {
  theme: {
    '@primary-color':'#1DA57A',
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
  title:'hi',
}
```

In addition, you can also configure headers for routing, for example,

```js
export default {
  title:'hi',
  routes: [
    {path:'/', title:'Home' },
    {path:'/users', title:'Users' },
    {path:'/foo', },
  ],
}
```

Then we visit `/` with a title of `Home`, visit `/users` with a title of `Users`, and visit `/foo` with a title of default `hi`.

note:

* By default, the `<title>` tag will not be output in HTML, which is obtained by dynamic rendering
* After configuring `exportStatic`, it will output `<title>` tags for each HTML
* If you need to render the title through react-helment, etc., configure `title: false` to disable the built-in title rendering mechanism
