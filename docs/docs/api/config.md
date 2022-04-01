# 配置

为方便查找，以下配置项通过字母排序。

## alias

* 类型：`Record<string, string>`
* 默认值：`{}`

配置别名，对 import 语句的 source 做隐射。

比如：

```js
{ alias: { foo: '/tmp/to/foo' } }
```

然后代码里 `import 'foo'` 实际上会 `import '/tmp/to/foo'`。

有几个 Tip。

1、alias 的值最好用绝对路径，尤其是指向依赖时，记得加 `require.resolve`，比如，

```js
// ⛔
{ alias: { foo: 'foo' } }

// ✅
{ alias: { foo: require.resolve('foo') } }
```

2、如果不需要子路径也被隐射，记得加 `$` 后缀，比如

```js
// import 'foo/bar' 会被隐射到 import '/tmp/to/foo/bar'
{ alias: { foo: '/tmp/to/foo' } }

// import 'foo/bar' 还是 import 'foo/bar'，不会被修改
{ alias: { foo$: '/tmp/to/foo' } }
```

## autoprefixer

* 类型：`object`
* 默认值：`{ flexbox: 'no-2009' }`

设置 [autoprefixer 的配置项](https://github.com/postcss/autoprefixer#options)。

## base

* 类型：`string`
* 默认值：`/`

设置路由 base，部署项目到非根目录下时使用。

比如有路由 `/` 和 `/users`，设置 base 为 `/foo/` 后就可通过 `/foo/` 和 `/foo/users` 访问到之前的路由。

## chainWebpack

* 类型：`(memo, args) => void`
* 默认值：`null`

用链式编程的方式修改 webpack 配置，基于 webpack-chain，具体 API 可参考 [webpack-api 的文档](https://github.com/mozilla-neutrino/webpack-chain)。

参数中，

* `memo` 是现有 webpack 配置
* `args` 包含一些额外信息和辅助对象，目前有 `env` 和 `webpack`。`env` 为当前环境，值为 `development` 或 `production`；`webpack` 为 webpack 对象，可从中获取 webpack 内置插件等

示例，

```js
export default {
  chainWebpack(memo, { env, webpack }) {
  	// 设置 alias
  	memo.resolve.alias.set('foo', '/tmp/to/foo');
  	
  	// 添加额外插件
  	memo.plugin('hello').use(Plugin, [...args]);
  	
  	// 删除 umi 内置插件
  	memo.plugins.delete('hmr');
  }
}
```

## conventionRoutes

* 类型：`{ base: string; exclude: RegExp[] }`
* 默认值：`null`

约定式路由相关配置。

其中 `base` 用于设置读取路由的基础路径，比如文档站点可能会需要将其改成 `./docs`；`exclude` 用于过滤一些不需要的文件，比如用于过滤 components、models 等。

示例，

```js
// 不识别 components 和 models 目录下的文件为路由
conventionRoutes: {
  exclude: [/\/components\//, /\/models\//]
}
```

## copy

* 类型：`string[]`
* 默认值：`[]`

配置要复制到输出目录的文件或文件夹。

比如你的目录结构如下，

```
+ src
    - index.ts
    + bar
        - bar.js
    - foo.js
```

然后设置，

```js
copy: ['foo.js', 'bar']
```

编译完成后，会额外输出以下文件，

```
+ dist
    + bar
        - bar.js
    - foo.js
```

## crossorigin

* 类型：`{ includes?: string[] }`
* 默认值：`false`

配置 script 标签的 crossorigin。如果有声明，会为本地 script 加上 crossorigin="anonymous" 的属性。

关于参数。`includes` 参数可以为额外的非本地 script 标签加上此属性。

比如：

```
crossorigin: {}
```

然后输出的 HTML 中会有这些变化，

```diff
- 
<script src="/umi.js"></script>
+ 
<script src="/umi.js" crossorigin="anonymous"></script>
```

## deadCode

* 类型：`{}`
* 默认值：`false`

检测未使用的文件和导出，仅在 build 阶段开启。

比如：

```
deadCode: {}
```

然后执行 build，如有发现，会有类似信息抛出。

```
Warning: There are 3 unused files:
 1. /mock/a.ts
 2. /mock/b.ts
 3. /pages/index.module.less
 Please be careful if you want to remove them (¬º-°)¬.
```

## define

* 类型：`Record<string, string>`
* 默认值：`{ process.env.NODE_ENV: 'development' | 'production' }`

设置代码中的可用变量。

注意：属性值会经过一次 `JSON.stringify` 转换。

比如，

```
define: { FOO: 'bar' }
```

然后代码里的 `console.log(hello, FOO)` 会被编译成 `console.log(hello, 'bar')`。

## devtool

* 类型：`string`
* 默认值：dev 时默认 `cheap-module-source-map`，build 时候默认无 sourcemap

设置 sourcemap 生成方式。

常见可选值有：

* `eval`，最快的类型，缺点是不支持低版本浏览器
* `source-map`，最慢但最全的类型

示例，

```js
// 关闭 dev 阶段的 sourcemap 生成
devtool: false

// 只设置 dev 阶段的 sourcemap
devtool: process.env.NODE_ENV === 'development' ? 'eval' : false
```

## externals

* 类型：`Record<string, string> | Function`
* 默认值：`{}`

设置哪些模块不打包，转而通过 `<script>` 或其他方式引入，通常需要搭配 scripts 或 headScripts 配置使用。

示例，

```
// external react
externals: { react: 'React' },
scripts: ['https://unpkg.com/react@17.0.1/umd/react.production.min.js'],
```

注意：不要轻易设置 antd 的 externals，由于依赖教多，使用方式复杂，可能会遇到较多问题，并且一两句话很难解释清楚。

## extraBabelPlugins

* 类型：`string[] | Function`
* 默认值：`[]`

配置额外的 babel 插件。可传入插件地址或插件函数。

## extraBabelPresets

* 类型：`string[] | Function`
* 默认值：`[]`

配置额外的 babel 插件集。可传入插件集地址或插件集函数。

## extraPostCSSPlugins

* 类型：`PostCSSPlugin[]`
* 默认值：`[]`

配置额外的 postcss 插件。

## favicon

* 类型：`string`
* 默认值：`null`

配置 favicon 路径。可以是绝对路径，也可以是基于项目根目录的相对路径。

比如：

```js
favicon: '/assets/favicon.ico'
```

HTML 中会生成 `<link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.ico" />`。

## forkTSChecker

* 类型：`object`
* 默认值：`null`

开启 TypeScript 的类型检查。基于 fork-ts-checker-webpack-plugin，配置项可参考 [fork-ts-checker-webpack-plugin 的 Options](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options)。

## hash

* 类型：`boolean`
* 默认值：`false`

开启 hash 模式，让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。

启用后，产物通常是这样，

```
+ dist
    - logo.sw892d.png
    - umi.df723s.js
    - umi.8sd8fw.css
    - index.html
```

注意：HTML 文件始终没有 hash 后缀。

## headScripts

* 类型：`string[] | Script[]`
* 默认值：`[]`

配置 `<head>` 中的额外 script。

比如，

```js
headScripts: [`alert(1);`, `https://a.com/b.js`]
```

会生成 HTML，

```html
<script>
    alert(1);
</script>
<script src="https://a.com/b.js"></script>
```

如果需要额外属性，切换到对象格式，比如，

```js
headScripts: [
    { src: '/foo.js', defer: true },
    { content: `alert('你好');`, charset: 'utf-8' },
]
```

## history

* 类型：`{ type: 'browser' | 'hash' | 'memory' }`
* 默认值：`{ type: 'browser' }`

设置路由 history 类型。

## https

* 类型：`{ cert: string; key: string; hosts: string[] }`
* 默认值：`{ hosts: ['127.0.0.1', 'localhost'] }`

开启 dev 的 https 模式。

关于参数。`cert` 和 `key` 分别用于指定 cert 和 key 文件；`hosts` 用于指定要支持 https 访问的 host，默认是 `['127.0.0.1', 'localhost']`。

示例，

```js
https: {}
```

## ignoreMomentLocale

* 类型：`boolean`
* 默认值：`true`

忽略 moment 的 locale 文件，用于减少产物尺寸。

注意：此功能默认开。配置 `ignoreMomentLocale: false` 关闭。

## inlineLimit

* 类型：`number`
* 默认值：`10000` (10k)

配置图片文件是否走 base64 编译的阈值。默认是 10000 字节，少于他会被编译为 base64 编码，否则会生成单独的文件。

## lessLoader

* 类型：`Object`
* 默认值：`{ modifyVars: userConfig.theme, javascriptEnabled: true }`

设置 less-loader 的 Options。具体参考参考 [less-loader 的 Options](https://github.com/webpack-contrib/less-loader#lessoptions)。

## links

* 类型：`Link[]`
* 默认值：`[]`

配置额外的 link 标签。

示例，

```js
links: [
  { href: '/foo.css', rel: 'preload' },
]
```

## manifest

* 类型：`{ fileName: string; basePath: string }`
* 默认值：`null`

开启 build 时生成额外的 manifest 文件，用于描述产物。

关于参数。`fileName` 是生成的文件名，默认是 `asset-manifest.json`；`basePath` 会给所有文件路径加上前缀。

注意：只在 build 时生成。

## metas

* 类型：`Meta[]`
* 默认值：`[]`

配置额外的 meta 标签。

比如，

```js
metas: [
  { name: 'keywords', content: 'umi, umijs' },
  { name: 'description', content: 'React framework.' },
]
```

会生成以下 HTML，

```html
<meta name="keywords" content="umi, umijs" />
<meta name="description" content="React framework." />
```

## mfsu

* 类型：`{ esbuild: boolean; mfName: string; cacheDirectory: string; chainWebpack: (memo, args) => void }`
* 默认值：`{ mfName: 'mf' }`

配置基于 Module Federation 的提速功能。

关于参数。`esbuild` 配为 `true` 后会让依赖的预编译走 esbuild，从而让首次启动更快，缺点是二次编译不会有 webpack 的物理缓存，稍慢一些；`mfName` 是此方案的 remote 库的全局变量，默认是 mf，通常在微前端中为了让主应用和子应用不冲突才会进行配置；`cacheDirectory` 可以自定义缓存目录，默认是 `node_modules/.cache/mfsu`; `chainWebpack` 用链式编程的方式修改 依赖的 webpack 配置，基于 webpack-chain，具体 API 可参考 [webpack-api 的文档](https://github.com/mozilla-neutrino/webpack-chain)。

示例，

```js
// 用 esbuild 做依赖预编译
mfsu: { esbuild: true }

// 关于 mfsu 功能
mfsu: false
```

```js
// webpack 配置修改
mfsu: {
  chainWebpack(memo, args) {
    // 添加额外插件
  	memo.plugin('hello').use(Plugin, [...args]);
    return memo;
  }
}
```

注意：此功能默认开。配置 `mfsu: false` 关闭。

## mock

* 类型：`{ exclude: string[], include: string[] }`
* 默认值：`{}`

配置 mock 功能。

关于参数。`exclude` 用于排除不需要的 mock 文件；`include` 用于额外添加 mock 目录之外的 mock 文件。

示例，

```js
// 让所有 pages 下的 _mock.ts 文件成为 mock 文件
mock: {
  include: ['src/pages/**/_mock.ts']
}
```

注意：此功能默认开。配置 `mock: false` 关闭。

## mountElementId

* 类型：`string`
* 默认值：`'root'`

配置 react 组件树渲染到 HTML 中的元素 id。

示例，

```js
mountElementId: 'container'
```

## monorepoRedirect

* 类型：`{ srcDir?: string[], exclude?: RegExp[] }`
* 默认值：`false`

在 monorepo 中使用 umi 时，你可能需要引入其他子包的组件、工具等，通过开启此选项来重定向这些子包的导入到他们的源码位置（默认为 `src` 文件夹），这也可以解决 `MFSU` 场景改动子包不热更新的问题。

通过配置 `srcDir` 来调整识别源码文件夹的优先位置，通过 `exclude` 来设定不需要重定向的依赖范围。

示例：

```js
// 默认重定向到子包的 src 文件夹
monorepoRedirect: {}
// 优先定向到 libs 文件夹
monorepoRedirect: { srcDir: ['libs', 'src'] }
// 不重定向 @scope/* 的子包
monorepoRedirect: { exclude: [/^@scope\/.+/] }
```

## outputPath

* 类型：`string`
* 默认值：`dist`

配置输出路径。

注意：不允许设定为 src、public、pages、mock、config、locales、models 等约定式功能相关的目录。

## plugins

* 类型：`string[]`
* 默认值：`[]`

配置额外的 umi 插件。

数组项为指向插件的路径，可以是 npm 依赖、相对路径或绝对路径。如果是相对路径，则会从项目根目录开始找。

示例，

```js
plugins: [
  // npm 依赖
  'umi-plugin-hello',
  // 相对路径
  './plugin',
  // 绝对路径
  `${__dirname}/plugin.js`,
],
```

## polyfill

* 类型：`{ imports: string[] }`
* 默认值：`{}`

设置按需引入的 polyfill。默认全量引入。

比如只引入 core-js 的 stable 部分，

```js
polyfill: {
  imports: ['core-js/stable']
}
```

如果对于性能有更极致的要求，可以考虑按需引入，

```js
polyfill: {
  imports: [
    'core-js/features/promise/try',
    'core-js/proposals/math-extensions',
  ]
}
```

注意：此功能默认开。配置 `polyfill: false` 或设置环境变量 `BABEL_POLYFILL=none` 关闭。

## postcssLoader

* 类型：`object`
* 默认值：`{}`

设置 [postcss-loader 的配置项](https://github.com/webpack-contrib/postcss-loader#options)。

## presets

* 类型：`string[]`
* 默认值：`[]`

配置额外的 umi 插件集。

数组项为指向插件集的路径，可以是 npm 依赖、相对路径或绝对路径。如果是相对路径，则会从项目根目录开始找。

示例，

```js
plugins: [
  // npm 依赖
  'umi-preset-hello',
  // 相对路径
  './preset',
  // 绝对路径
  `${__dirname}/preset.js`,
],
```

## proxy

* 类型：`object`
* 默认值：`{}`

配置代理功能。

比如，

```js
proxy: {
  '/api': {
    'target': 'http://jsonplaceholder.typicode.com/',
    'changeOrigin': true,
    'pathRewrite': { '^/api' : '' },
  }
}
```

然后访问 `/api/users` 就能访问到 http://jsonplaceholder.typicode.com/users 的数据。

注意：proxy 功能仅在 dev 时有效。

## publicPath

* 类型：`string`
* 默认值：`/`

配置 webpack 的 publicPath。

## routes

* 类型：`Route[]`
* 默认值：`[]`

配置路由。

## runtimePublicPath

* 类型：`boolean`
* 默认值：`false`

启用运行时 publicPath。

## scripts

* 类型：`string[] | Script[]`
* 默认值：`[]`

配置 `<body>` 中额外的 script 标签。

比如，

```js
scripts: [`alert(1);`, `https://a.com/b.js`]
```

会生成 HTML，

```html
<script>
    alert(1);
</script>
<script src="https://a.com/b.js"></script>
```

如果需要额外属性，切换到对象格式，比如，

```js
scripts: [
    { src: '/foo.js', defer: true },
    { content: `alert('你好');`, charset: 'utf-8' },
]
```

## styleLoader

* 类型：`object`
* 默认值：`false`

启用 style loader 功能，让 CSS 内联在 JS 中，不输出额外的 CSS 文件。

## styles

* 类型：`string[]`
* 默认值：`[]`

配置额外的 CSS。

配置项支持内联样式和外联样式路径，后者通过是否以 https?:// 开头来判断。

比如：

```js
styles: [`body { color: red; }`, `https://a.com/b.css`]
```

会生成以下 HTML，

```html
<style>
  body {
    color: red;
  }
</style>
<link rel="stylesheet" href="https://a.com/b.css" />
```

## targets

* 类型：`object`
* 默认值：`{ chrome: 87 }`

配置需要兼容的浏览器最低版本。Umi 会根据这个自定引入 polyfill、配置 autoprefixer 和做语法转换等。

示例，

```js
// 兼容 ie11
targets: { ie: 11 }
```

## theme

* 类型：`object`
* 默认值：`{}`

配置 less 变量主题。

示例：

```js
theme: { '@primary-color': '#1DA57A' }
```

## verifyCommit

* 类型：`{ scope: string[]; allowEmoji: boolean }`
* 默认值：`{}`

针对 verify-commit 命令的配置项。

关于参数。`scope` 用于配置允许的 scope，配置后会覆盖默认的；`allowEmoji` 开启后会允许加 EMOJI 前缀，比如 `💥 feat(模块): 添加了个很棒的功能`。

```
verifyCommit: {
  scope: ['feat', 'fix'],
  allowEmoji: true,
}
```


## vite

* 类型：`object`
* 默认值：`{}`

开发者的配置会 merge 到 vite 的 [默认配置](https://vitejs.dev/config/)。

示例，

```js
// 更改临时文件路径到 node_modules/.bin/.vite 文件夹
vite: {
    cacheDir:'node_modules/.bin/.vite'
  }
```
