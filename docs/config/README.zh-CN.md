---
nav:
  title: 配置
  order: 2
toc: menu
---

# 配置

以下配置项通过字母排序。

## alias

* Type: `object`
* Default: `{}`

配置别名，对引用路径进行隐射。

比如：

```js
export default {
  alias: {
    'foo': '/tmp/a/b/foo'
  }
}
```

然后 `import('foo')`，实际上是 `import('/tmp/a/b/foo')`。

Umi 内置了以下别名：

* `@`，项目 src 目录
* `@@`，临时目录，通常是 `src/.umi` 目录
* `umi`，当前所运行的 umi 仓库目录
* `react-router` 和 `react-router-dom`，底层路由库，锁定版本，打包时所有依赖了他们的地方使用同一个版本
* `react` 和 `react-dom`，默认使用 `16.x` 版本，但如果项目里有依赖，会优先使用项目中依赖的版本

## analyze

* Type: `object`
* Default: `{}`

包模块结构分析工具，可以看到项目各模块的大小，按需优化。通过 `ANALYZE=1 umi build` 或 `ANALYZE=1 umi dev` 开启，默认 server 端口号为 `8888`，更多配置如下：

```js
{
  // 配置具体含义见：https://github.com/umijs/umi-webpack-bundle-analyzer#options-for-plugin
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

设置 [autoprefixer 的配置项](https://github.com/postcss/autoprefixer#options)。

注意：

* 不要设置 `overrideBrowserslist`，此配置被内部接管，通过 `targets` 配置项选择你要兼容的浏览器。

## base

* Type: `string`
* Default: `/`

设置路由前缀，通常用于部署到非根目录。

比如，你有路由 `/` 和 `/users`，然后设置了 base 为 `/foo/`，那么就可以通过 `/foo/` 和 `/foo/users` 访问到之前的路由。

## chainWebpack

* Type: `Function`

通过 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 的 API 修改 webpack 配置。

比如：

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // 设置 alias
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');

    // 删除 umi 内置插件
    memo.plugins.delete('progress');
    memo.plugins.delete('friendly-error');
    memo.plugins.delete('copy');
  }
}
```

参数有，

* memo，当前 webpack-chain对象
* env，当前环境，`development`、`production` 或 `test` 等
* webpack，webpack 实例，用于获取其内部插件

## chunks

默认是 `['umi']`，可修改，比如做了 vendors 依赖提取之后，会需要在 `umi.js` 之前加载 `vendors.js`。

比如：

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

设置 [css-loader 配置项](https://github.com/webpack-contrib/css-loader#options)。

## cssnano

* Type: `{ mergeRules: false, minifyFontValues: { removeQuotes: false } }`
* Default: `{}`

设置 [cssnano 配置项](https://cssnano.co/optimisations/)，基于 default 的配置集合。

比如：`.box { background: url("./css/../img/cat.jpg"); }` 默认会被压缩成 `.box { background: url(img/cat.jpg); }` ，如果不想要这个特性，可以设置，

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

设置要复制到输出目录的文件或文件夹。

比如你的目录结构如下，

```js
+ src
  - index.ts
+ bar
  - bar.js
- foo.js
```

然后设置，

```js
export default {
  copy: [
    'foo.js',
    'bar',
  ]
}
```

编译完成后，会额外输出以下文件，

```js
+ dist
  + bar
    - bar.js
  - foo.js
```

## define

* Type: `object`
* Default: `{}`

用于提供给代码中可用的变量。

比如：

```js
export default {
  define: {
    FOO: 'bar',
  }
}
```

然后你写 `console.log(hello, FOO);` 会被编译成 `console.log(hello, 'bar')`。

注意：

* define 对象的属性值会经过一次 JSON.stringify 转换

内置的 define 属性，

* process.env.NODE\_ENV，值为 `development` 或 `production`

如果你有一些不想在生成环境运行的代码，比如断言判断，可以这样，

```js
if (process.env.NODE_ENV === 'development') {
  assert(foo === bar, 'foo is not equal to bar');
}
```

dev 时正常运行，build 后会变成为，

```js
if (false) {
  assert(foo === bar, 'foo is not equal to bar');
}
```

进而被压缩掉，不输出在生成环境的代码中。

## devServer

* Type: `object`
* Default: `{}`

配置开发服务器。

包含以下子配置项，

* port，端口号，默认 `8000`
* host，默认 `0.0.0.0`
* https，是否启用 https server
* http2，是否启用 http2

启用 port 和 host 也可以通过环境变量 PORT 和 HOST 临时指定。

## devtool

* Type: `string`
* Default: `cheap-module-source-map` in dev, `false` in build

用户配置 sourcemap 类型。

常见的可选类型有：

* eval，最快的类型，但不支持低版本浏览器，如果编译慢，可以试试
* source-map，最慢最全的类型

更多类型详见 [webpack#devtool 配置](https://webpack.js.org/configuration/devtool/#devtool)。

## dynamicImport

* Type: `object`
* Default: `false`

是否启用按需加载，即是否把构建产物进行拆分，在需要的时候下载额外的 JS 再执行。

默认关闭时，只生成一个 js 和一个 css，即 `umi.js` 和 `umi.css`。优点是省心，部署方便；缺点是对用户来说初次打开网站会比较慢。

打包后通常是这样的，

```bash
+ dist
  - umi.js
  - umi.css
  - index.html
```

启用之后，需要考虑 publicPath 的配置，可能还需要考虑 runtimePublicPath，因为需要知道从哪里异步加载 JS、CSS 和图片等资源。

打包后通常是这样，

```bash
+ dist
  - umi.js
  - umi.css
  - index.html
  - p__index.js
  - p__users__index.js
```

这里的 `p__users_index.js` 是路由组件所在路径 `src/pages/users/index`，其中 `src` 会被忽略，`pages` 被替换为 `p`。

包含以下子配置项，

* loading, 类型为字符串，指向 loading 组件文件

比如：

```js
export default {
  dynamicImport: {
    loading: '@/Loading',
  },
}
```

然后在 src 目录下新建 `Loading.tsx`，

```jsx
import React from 'react';

export default () => {
  return <div>加载中...</div>;
}
```

构建之后使用低网络模拟就能看到效果。

## exportStatic

* Type: `object`

配置 html 的输出形式，默认只输出 `index.html`。

如果开启 `exportStatic`，则会针对每个路由输出 html 文件。

包含两个子属性，

* htmlSuffix，启用 `.html` 后缀。
* dynamicRoot，部署到任意路径。

比如以下路由，

```bash
/
/users
/list
```

不开启 `exportStatic` 时，输出，

```bash
- index.html
```

设置 `exportStatic: {}` 后，输出，

```bash
- index.html
- users/index.html
- list/index.html
```

设置 `exportStatic: { htmlSuffix: true }` 后，输出，

```bash
- index.html
- users.html
- list.html
```

## externals

* Type: `object`
* Default: `{}`

设置哪些模块可以不被打包，通过 `<script>` 或其他方式引入，通常需要和 scripts 或 headScripts 配置同时使用。

比如，

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

简单理解的话，可以理解为 `import react from 'react'` 会被替换为 `const react = window.React`。

## extraBabelPlugins

* Type: `Array`
* Default: `[]`

配置额外的 babel 插件。

比如：

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

配置额外的 babel 插件集。

## extraPostCSSPlugins

* Type: `Array`
* Default: `[]`

配置额外的 [postcss 插件](https://github.com/postcss/postcss/blob/master/docs/plugins.md)。

## favicon

* Type: `string`

配置 favicon 地址（href 属性）。

比如，

```js
export default {
  favicon: '/assets/favicon.ico',
}
```

HTML 中会生成，

```html
<link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.ico" />
```

## forkTSCheker

* Type: `object`

开启 TypeScript 编译时类型检查，默认关闭。

## hash

* Type: `boolean`
* Default: `false`

配置是否让生成的文件包含 hash 后缀，通常用于增量发布和避免浏览器加载缓存。

启用 hash 后，产物通常是这样，

```bash
+ dist
  - logo.sw892d.png
  - umi.df723s.js
  - umi.8sd8fw.css
  - index.html
```

注：

* html 文件始终没有 hash

## headScripts

* Type: `Array`
* Default: `[]`

配置 `<head>` 里的额外脚本，数组项为字符串或对象。

大部分场景下用字符串格式就够了，比如：

```js
export default {
  headScripts: [
    `alert(1);`,
    `https://a.com/b.js`,
  ],
}
```

会生成 HTML，

```html
<head>
  <script>alert(1);</script>
  <script src="https://a.com/b.js"></script>
</head>
```

如果要使用额外属性，可以用对象的格式，

```js
export default {
  headScripts: [
    { src: '/foo.js', defer: true },
    { content: `alert('你好');`, charset: 'utf-8' },
  ],
}
```

会生成 HTML，

```html
<head>
  <script src="/foo.js" defer></script>
  <script charset="utf-8">alert('你好');</script>
</head>
```

## history

* Type: `object`
* Default: `{ type: 'browser' }`

配置 [history 类型和配置项](https://github.com/ReactTraining/history/blob/master/docs/GettingStarted.md)。

包含以下子配置项，

* type，可选 `browser`、`hash` 和 `memory`
* options，传给 create{{{ type }}}History 的配置项，每个类型器的配置项不同

注意，

* options 中，`getUserConfirmation` 由于是函数的格式，暂不支持配置
* options 中，`basename` 无需配置，通过 umi 的 `base` 配置指定

## ignoreMomentLocale

* Type: `true`
* Default: `false`

忽略 moment 的 locale 文件，用于减少尺寸。

## inlineLimit

* Type: `number`
* Default: `10000` (10k)

配置图片文件是否走 base64 编译的阈值。默认是 10000 字节，少于他会被编译为 base64 编码，否则会生成单独的文件。

## lessLoader

* Type: `object`
* Default: `{}`

设置 [less-loader 配置项](https://github.com/webpack-contrib/less-loader)。

## links

* Type: `Array`
* Default: `[]`

配置额外的 link 标签。

## manifest

* Type: `object`

配置是否需要生成额外用于描述产物的 manifest 文件，默认会生成 `asset-manifest.json`。

包含以下子配置项，

* fileName，文件名，默认是 `asset-manifest.json`
* publicPath，默认会使用 webpack 的 `output.publicPath` 配置
* basePath，给所有文件路径加前缀

注意：

* 只在 `umi build` 时会生成

## metas

* Type: `Array`
* Default: `[]`

配置额外的 meta 标签。

## mock

* Type: `object`
* Default: `{}`

配置 mock 属性。

包含以下子属性，

* exclude，格式为 `Array(string)`，用于忽略不需要走 mock 的文件

## mountElementId

* Type: `string`
* Default: `root`

指定 react app 渲染到的 HTML 元素 id。

## outputPath

* Type: `string`
* Default: `dist`

指定输出路径。

注意：

* 不允许设定为 `src`、`public`、`pages`、`mock`、`config` 等约定目录

## plugins

* Type: `Array(string)`
* Default: `[]`

配置额外的 umi 插件。

数组项为指向插件的路径，可以是 npm 依赖、相对路径或绝对路径。如果是相对路径，则会从项目根目录开始找。

```js
export default {
  plugins: [
    // npm 依赖
    'umi-plugin-hello',
    // 相对路径
    './plugin',
    // 绝对路径
    `${__dirname}/plugin.js`,
  ],
};
```

插件的参数平级的配置项声明，比如：

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

配置项的名字通常是插件名去掉 `umi-plugin-` 或 `@umijs/plugin` 前缀。

## presets

* Type: `Array(string)`
* Default: `[]`

同 `plugins` 配置，用于配置额外的 umi 插件集。

## proxy

* Type: `object`
* Default: `{}`

配置代理能力。

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

然后访问 `/api/users` 就能访问到 [http://jsonplaceholder.typicode.com/users](http://jsonplaceholder.typicode.com/users) 的数据。

## publicPath

* Type: `publicPath`
* Default: `/`

配置 publicPath。

## routes

* Type: `Array(route)`

配置路由。

umi 的路由基于 [react-router@5](https://reacttraining.com/react-router/web/guides/quick-start) 实现，配置和 react-router 基本一致，详见[路由配置](TODO)章节。

比如：

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

注意：

* `component` 的值如果是相对路径，会以 `src/pages` 为基础路径开始解析
* 如果配置了 `routes`，则优先使用配置式路由，且约定式路由会不生效

## runtimePublicPath

* Type: `boolean`
* Default: `false`

配置是否启用运行时 publicPath。

通常用于一套代码在不同环境有不同的 publicPath 需要，然后 publicPath 由服务器通过 HTML 的 `window.publicPath` 全局变量输出。

启用后，打包时会额外加上这一段，

```js
__webpack_public_path__ = window.publicPath;
```

然后 webpack 在异步加载 JS 等资源文件时会从 `window.publicPath` 里开始找。

## scripts

* Type: `Array`
* Default: `[]`

同 [headScripts](TODO)，配置 `<body>` 里的额外脚本。

## singular

* Type: `boolean`
* Default: `false`

配置是否启用单数模式的目录。

比如 `src/pages` 的约定在开启后为 `src/page` 目录，[@umijs/plugins](https://github.com/umijs/plugins) 里的插件也遵照此配置的约定。

## ssr

暂未在 umi@3 中实现。

## styleLoader

* Type: `object`

启用并设置 [style-loader 配置项](https://github.com/webpack-contrib/style-loader)，用于让 CSS 内联打包在 JS 中，不输出额外的 CSS 文件。

## styles

* Type: `Array(string)`
* Default: `[]`

配置额外 CSS。

比如：

```js
export default {
  styles: [
    `body { color: red; }`,
    `https://a.com/b.css`,
  ],
}
```

会生成 HTML，

```html
<head>
  <style>body { color: red; }</style>
  <link rel="stylesheet" href="https://a.com/b.css" />
</head>
```

## targets

* Type: `object`
* Default: `{ chrome: 49, firefox: 64, safari: 10, edge: 13, ios: 10 }`

配置需要兼容的浏览器最低版本，会自动引入 polyfill 和做语法转换。

比如要兼容 ie11，需配置：

```js
export default {
  targets: {
    ie: 11,
  },
};
```

注意：

* 配置的 targets 会和合并到默认值，不需要重复配置
* 子项配置为 `false` 可删除默认配置的版本号

## terserOptions

* Type: `object`
* Default: [terserOptions.ts](https://github.com/umijs/umi/blob/master/packages/bundler-webpack/src/getConfig/terserOptions.ts)

配置[压缩器 terser 的配置项](https://github.com/terser/terser#minify-options)。

## theme

* Type: `object`
* Default: `{}`

配置主题，实际上是配 less 变量。

比如：

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

配置标题。

比如：

```js
export default {
  title: 'hi',
}
```

此外，你还可以针对路由配置标题，比如，

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

然后我们访问 `/` 标题是 `Home`，访问 `/users` 标题是 `Users`，访问 `/foo` 标题是默认的 `hi`。

注意：

* 默认不会在 HTML 里输出 `<title>` 标签，通过动态渲染得到
* 配 `exportStatic` 后会为每个 HTML 输出 `<title>` 标签

> 建议经常在构建完后使用，更有利于应用优化。

