---
nav:
  title: Config
  order: 2
translateHelp: true
toc: menu
---

# Config


以下配置项通过字母排序。

## alias

* Type: `object`
* Default: `{}`

配置别名，对引用路径进行映射。

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
  chainWebpack(memo, { env, webpack, createCSSRule }) {
    // 设置 alias
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');

    // 删除 umi 内置插件
    memo.plugins.delete('progress');
    memo.plugins.delete('friendly-error');
    memo.plugins.delete('copy');
  }
}
```

支持异步，

```js
export default {
  async chainWebpack(memo) {
    await delay(100);
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');
  }
}
```

SSR 时，修改服务端构建配置

```js
import { BundlerConfigType } from 'umi';

export default {
  chainWebpack(memo, { type }) {
    // 对 ssr bundler config 的修改
    if (type === BundlerConfigType.ssr) {
      // 服务端渲染构建扩展
    }

    // 对 csr bundler config 的修改
    if (type === BundlerConfigType.csr) {
      // 客户端渲染构建扩展
    }

    // ssr 和 csr 都扩展
  }
}
```

参数有，

* memo，当前 webpack-chain对象
* env，当前环境，`development`、`production` 或 `test` 等
* webpack，webpack 实例，用于获取其内部插件
* createCSSRule，用于扩展其他 CSS 实现，比如 sass, stylus
* type，当前 webpack 实例类型，默认走 csr，如果开启 ssr，会有 ssr 的 webpack 实例

## chunks

默认是 `['umi']`，可修改，比如做了 vendors 依赖提取之后，会需要在 `umi.js` 之前加载 `vendors.js`。

比如：

```js
export default {
  chunks: ['vendors', 'umi'],
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

若希望将 ClassName 类名变成驼峰命名形式，可配置：

```js
{
  cssLoader: {
    localsConvention: 'camelCase'
  }
}
```

则以下写法将自动转成驼峰命名：

```tsx
import React from 'react';

import styles from './index.less'; // .bar-foo { font-size: 16px; }

export default () => <div className={styles.barFoo}>Hello</div>;
// => <div class="bar-foo___{hash}">Hello</div>
```

## cssModulesTypescriptLoader <Badge>3.1+</Badge>

* type: `{ mode: 'verify' | 'emit' }`
* Default: `undefined`

对按照 css modules 方式引入的 css 或 less 等样式文件，自动生成 ts 类型定义文件。

比如：

```js
export default {
  cssModulesTypescriptLoader: {},
}
```

等同于以下配置，`mode` 默认为 `emit`，

```js
export default {
  cssModulesTypescriptLoader: {
    mode: 'emit',
  },
}
```

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
* https，是否启用 https server，同时也会开启 HTTP/2
* writeToDisk，生成 `assets` 到文件系统

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

如果需要预渲染，请开启 [ssr](#ssr-32) 配置，常用来解决没有服务端情况下，页面的 SEO 和首屏渲染提速。

如果开启 `exportStatic`，则会针对每个路由输出 html 文件。

包含以下几个属性，

* htmlSuffix，启用 `.html` 后缀。
* dynamicRoot，部署到任意路径。
* extraRoutePaths，生成额外的路径页面，用法和场景见 [预渲染动态路由](/zh-CN/docs/ssr#预渲染动态路由)

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

若有 [SEO](https://baike.baidu.com/item/%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E%E4%BC%98%E5%8C%96/3132?fromtitle=SEO&fromid=102990) 需求，可开启 [ssr](#ssr) 配置，在 `umi build` 后，会路由（除静态路由外）渲染成有具体内容的静态 html 页面，例如如下路由配置：

```jsx
// .umirc.ts | config/config.ts
{
  routes: [
    {
      path: '/',
      component: '@/layouts/Layout',
      routes: [
        { path: '/', component: '@/pages/Index' },
        { path: '/bar', component: '@/pages/Bar' },
        { path: '/news', component: '@/pages/News' },
        { path: '/news/:id', component: '@/pages/NewsDetail' },
      ]
    },
  ]
}
```

设置 `{ ssr: {}, exportStatic: { }` 后，输出，

会在编译后，生成如下产物：

```bash
- dist
  - umi.js
  - umi.css
  - index.html
  - bar
    - index.html
  - news
    - index.html
    - [id].html
```

考虑到预渲染后，大部分不会再用到 `umi.server.js` 服务端文件，构建完成后会删掉 `umi.server.js` 文件如果有调试、不删除 server 文件需求，可通过环境变量 `RM_SERVER_FILE=none` 来保留。

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

> 如果要使用本地的图片，图片请放到 `public` 目录

HTML 中会生成，

```html
<link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.ico" />
```

## forkTSChecker

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
* writeToFileEmit，开发模式下，写 manifest 到文件系统中

注意：

* 只在 `umi build` 时会生成

## metas

* Type: `Array`
* Default: `[]`

配置额外的 meta 标签。数组中可以配置`key:value`形式的对象。

最终生成的meta标签格式为: `<meta key1="value1" key2="value2"/>`。

如以下配置:
```js
export default {
  metas:[
    {
      name: 'keywords',
      content: 'umi, umijs'
    },
    {
      name: 'description',
      content: '🍙 插件化的企业级前端应用框架。'
    },
    {
      bar: 'foo',
    },
  ],
}
```

最终生成的html标签是:
```html
<meta name="keywords" content="umi, umijs"/>
<meta name="description" content="🍙 插件化的企业级前端应用框架。"/>
<meta bar="foo"/>
```

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

注意：

* 如果需要把应用打包成 umd 包导出，需设置 mountElementId 为 `''`

## mpa <Badge>3.1+</Badge>

* Type: `object`

切换渲染模式为 mpa。

包含以下特征：

* 为每个页面输出 html
* 输出不包含 react-router、react-router-dom、history 等库
* 渲染和 url 解绑，html 文件放哪都能使用

注意：

* 只支持一级路由配置
* 不支持 layout 或嵌套路由的配置

## nodeModulesTransform <Badge>3.1+</Badge>

* Type: `object`
* Default: `{ type: 'all' }`

设置 node\_modules 目录下依赖文件的编译方式。

子配置项包含，

* `type`，类型，可选 `all` 和 `none`
* `exclude`，忽略的依赖库，包名，暂不支持绝对路径

两种编译模式，

* 默认是 `all`，全部编译，然后可以通过 `exclude` 忽略不需要编译的依赖库；
* 可切换为 `none`，默认值编译 [es5-imcompatible-versions](https://github.com/umijs/es5-imcompatible-versions) 里声明的依赖，可通过 `exclude` 配置添加额外需要编译的；

前者速度较慢，但可规避常见的兼容性等问题，后者反之。

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

## polyfill

* Type: `{ imports: string[] }`

设置按需引入 polyfill，对应core-js的[引入范围](https://github.com/zloirock/core-js#commonjs-api)，默认全量引入。

只引入稳定功能：

```
export default {
  polyfill: {
    imports: [
      'core-js/stable',
    ]
  }
}
```

或自行按需引入：

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

注意：

* 设置 `BABEL_POLYFILL=none` 环境变量后，该配置失效，且无 polyfill 引入。

## postcssLoader

* Type: `object`
* Default: `{}`

设置 [postcss-loader 配置项](https://github.com/postcss/postcss-loader#options)。

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

配置 webpack 的 publicPath。当打包的时候，webpack 会在静态文件路径前面添加 `publicPath` 的值，当你需要修改静态文件地址时，比如使用 CDN 部署，把 `publicPath` 的值设为 CDN 的值就可以。如果使用一些特殊的文件系统，比如混合开发或者 cordova 等技术，可以尝试将 `publicPath` 设置成 `./`。

## request

* Type: `object`

dataField 对应接口统一格式中的数据字段，比如接口如果统一的规范是 { success: boolean, data: any} ，那么就不需要配置，这样你通过 useRequest 消费的时候会生成一个默认的 formatResult，直接返回 data 中的数据，方便使用。如果你的后端接口不符合这个规范，可以自行配置 dataField 。配置为 '' （空字符串）的时候不做处理。

```js
export default {
  request: {
    dataField: 'info'
  }
};
```

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

## runtimeHistory

* Type: `object`

配置是否需要动态变更 history 类型。

设置 runtimeHistory 后，可以在运行时动态修改 history 类型。

```js
import { setCreateHistoryOptions } from 'umi';

setCreateHistoryOptions({
  type: 'memory'
});
```


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

## ssr <Badge>3.2+</Badge>

* Type: `object`
* Default: `false`

配置是否开启服务端渲染，配置如下：

```js
{
  // 一键开启
  ssr: {
    // 更多配置
    // forceInitial: false,
    // devServerRender: true,
    // mode: 'string,
    // staticMarkup: false,
  }
}
```

配置说明：

* `forceInitial`：客户端渲染时强制执行 `getInitialProps` 方法，常见的场景：静态站点希望每次访问时保持数据最新，以客户端渲染为主。
* `devServerRender`：在 `umi dev` 开发模式下，执行渲染，用于 umi SSR 项目的快速开发、调试，服务端渲染效果所见即所得，同时我们考虑到可能会与服务端框架（如 [Egg.js](https://eggjs.org/)、[Express](https://expressjs.com/)、[Koa](https://koajs.com/)）结合做本地开发、调试，关闭后，在 `umi dev` 下不执行服务端渲染，但会生成 `umi.server.js`（Umi SSR 服务端渲染入口文件），渲染开发流程交由开发者处理。
* `mode`：渲染模式，默认使用 `string` 字符串渲染，同时支持流式渲染 `mode: 'stream'`，减少 TTFB（浏览器开始收到服务器响应数据的时间） 时长。
* `staticMarkup`：html 上的渲染属性（例如 React 渲染的 `data-reactroot`），常用于静态站点生成的场景上。

注意：

* 开启后，执行 `umi dev` 时，访问 http://localhost:8000 ，默认将单页应用（SPA）渲染成 html 片段，片段可以通过开发者工具『显示网页源代码』进行查看。
* 执行 `umi build`，产物会额外生成 `umi.server.js` 文件，此文件运行在 Node.js 服务端，用于做服务端渲染，渲染 html 片段。
* 如果应用没有 Node.js 服务端，又希望生成 html 片段做 SEO（搜索引擎优化），可以开启 [exportStatic](#exportstatic) 配置，会在执行 `umi build` 构建时进行**预渲染**。

了解更多，可点击 [服务端渲染文档](/zh-CN/docs/ssr)。

## scripts

* Type: `Array`
* Default: `[]`

同 [headScripts](TODO)，配置 `<body>` 里的额外脚本。

## singular

* Type: `boolean`
* Default: `false`

配置是否启用单数模式的目录。

比如 `src/pages` 的约定在开启后为 `src/page` 目录，[@umijs/plugins](https://github.com/umijs/plugins) 里的插件也遵照此配置的约定。

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
* 如果需要自行通过 react-helment 等方式渲染 title，配 `title: false` 可禁用内置的 title 渲染机制
