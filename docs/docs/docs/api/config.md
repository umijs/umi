---
order: 2
toc: content
---
# 配置

对于 umi 中能使用的自定义配置，你可以使用项目根目录的 `.umirc.ts` 文件或者 `config/config.ts`，值得注意的是这两个文件功能一致，仅仅是存在目录不同，2 选 1 ，`.umirc.ts` 文件优先级较高。

> 更多目录相关信息介绍，你可以在[目录结构](../guides/directory-structure)了解。

umi 的配置文件是一个正常的 node 模块，它在执行 umi [命令行](./commands)的时候使用，并且不包含在浏览器端构建中。

> 关于浏览器端构建需要用到的一些配置，还有一些在样式表现上产生作用的一些配置，在 umi 中被统一称为“运行时配置”，你可以在[运行时配置](./runtime-config)看到更多关于它的说明。

这里有一个最简单的 umi 配置文件的范例：

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  outputPath: 'dist',
});
```

使用 `defineConfig` 包裹配置是为了在书写配置文件的时候，能得到更好的拼写联想支持。如果你不需要，直接 `export default {}` 也可以。

值得关注的是在你使用 umi 的时候，你不需要了解每一个配置的作用。你可以大致的浏览一下以下 umi 支持的所有配置，然后在你需要的时候，再回来查看如何启用和修改你需要的内容。

> 为方便查找，以下配置项通过字母排序。

## alias

- 类型：`Record<string, string>`
- 默认值：`{}`

配置别名，对 import 语句的 source 做映射。

比如：

```js
{
  alias: {
    foo: '/tmp/to/foo',
  }
}
```

然后代码里 `import 'foo'` 实际上会 `import '/tmp/to/foo'`。

有几个 Tip。

1、alias 的值最好用绝对路径，尤其是指向依赖时，记得加 `require.resolve`，比如，

```js
// ⛔
{
  alias: {
    foo: 'foo',
  }
}

// ✅
{
  alias: {
    foo: require.resolve('foo'),
  }
}
```

2、如果不需要子路径也被映射，记得加 `$` 后缀，比如

```js
// import 'foo/bar' 会被映射到 import '/tmp/to/foo/bar'
{
  alias: {
    foo: '/tmp/to/foo',
  }
}

// import 'foo/bar' 还是 import 'foo/bar'，不会被修改
{
  alias: {
    foo$: '/tmp/to/foo',
  }
}
```

## autoprefixer

- 类型：`object`
- 默认值：`{ flexbox: 'no-2009' }`

用于解析 CSS 并使用来自 Can I Use 的值将供应商前缀添加到 CSS 规则。如自动给 CSS 添加 `-webkit-` 前缀。

更多配置，请查阅 [autoprefixer 的配置项](https://github.com/postcss/autoprefixer#options)。

## analyze

- 类型：`object`
- 默认值：`{}`

通过指定 [`ANALYZE`](../guides/env-variables#analyze) 环境变量分析产物构成时，analyzer 插件的具体配置项，见 [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin)

使用 Vite 模式时，除了可以自定义 [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) 的配置， `excludeAssets`、`generateStatsFile`、`openAnalyzer`、`reportFilename`、`reportTitle` 这些选项会自动转换适配。

## base

- 类型：`string`
- 默认值：`/`

要在非根目录下部署 umi 项目时，你可以使用 base 配置。

base 配置允许你为应用程序设置路由前缀。比如有路由 `/` 和 `/users`，设置 base 为 `/foo/` 后就可通过 `/foo/` 和 `/foo/users` 访问到之前的路由。

> 注意：base 配置必须在构建时设置，并且不能在不重新构建的情况下更改，因为该值内联在客户端包中。

## cacheDirectoryPath

- 类型：`string`
- 默认值：`node_modules/.cache`

默认情况下 Umi 会将构建中的一些缓存文件存放在 `node_modules/.cache` 目录下，比如 logger 日志，webpack 缓存，mfsu 缓存等。你可以通过使用 `cacheDirectoryPath` 配置来修改 Umi 的缓存文件目录。

示例，

```js
// 更改缓存文件路径到 node_modules/.cache1 文件夹
cacheDirectoryPath: 'node_modules/.cache1',
```

## chainWebpack

- 类型：`(memo, args) => void`
- 默认值：`null`

为了扩展 Umi 内置的 webpack 配置，我们提供了用链式编程的方式修改 webpack 配置，基于 webpack-chain，具体 API 可参考 [webpack-api 的文档](https://github.com/mozilla-neutrino/webpack-chain)。

如下所示：

```js
export default {
  chainWebpack(memo, args) {
    return memo;
  },
};
```

该函数具有两个参数：

- `memo` 是现有 webpack 配置
- `args` 包含一些额外信息和辅助对象，目前有 `env` 和 `webpack`。`env` 为当前环境，值为 `development` 或 `production`；`webpack` 为 webpack 对象，可从中获取 webpack 内置插件等

用法示例：

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // 设置 alias
    memo.resolve.alias.set('foo', '/tmp/to/foo');

    // 添加额外插件
    memo.plugin('hello').use(Plugin, [...args]);

    // 删除 Umi 内置插件
    memo.plugins.delete('hmr');
  },
};
```

## clickToComponent

- 类型: `{ editor?: string }`
- 默认值: `false`

> 当前仅 React 项目支持。

开启后，可通过 `Option+Click/Alt+Click` 点击组件跳转至编辑器源码位置，`Option+Right-click/Alt+Right-click` 可以打开上下文，查看父组件。

关于参数。`editor` 为编辑器名称，默认为 'vscode'，支持 `vscode` & `vscode-insiders`。

配置 clickToComponent 的行为，详见 [click-to-component](https://github.com/ericclemmons/click-to-component)。

示例：

```ts
// .umirc.ts
export default {
  clickToComponent: {},
};
```

## clientLoader

- 类型: `{}`
- 默认值: `false`

开启后，可以为每个路由声明一个数据加载函数 `clientLoader`，将页面需要的加载数据程序提取到 `clientLoader` 可以让 Umi
提前在页面组件尚未加载好的时候提前进行数据的加载，避免瀑布流请求的问题，详细介绍请看 [路由数据预加载](../guides/client-loader)。

示例：

```ts
// .umirc.ts
export default {
  clientLoader: {},
};
```

配置开启后，在路由组件中使用：

```jsx
// pages/.../some_page.tsx

import { useClientLoaderData } from 'umi';

export default function SomePage() {
  const { data } = useClientLoaderData();
  return <div>{data}</div>;
}

export async function clientLoader() {
  const data = await fetch('/api/data');
  return data;
}
```

## codeSplitting

- 类型：`{ jsStrategy: 'bigVendors' | 'depPerChunk' | 'granularChunks'; jsStrategyOptions: {} }`
- 默认值：`null`

用于配置 code splitting 的策略方案，Umi 默认以路由为分界拆分 chunk，实现路由维度的 chunk 按需加载，如果在此之上希望继续提取公共 chunk，可以选择合适的策略进行配置，差异如下。

bigVendors 是大 vendors 方案，会将 async chunk 里的 node_modules 下的文件打包到一起，可以避免重复。同时缺点是，1）单文件的尺寸过大，2）毫无缓存效率可言。

depPerChunk 和 bigVendors 类似，不同的是把依赖按 package name + version 进行拆分，算是解了 bigVendors 的尺寸和缓存效率问题。但同时带来的潜在问题是，可能导致请求较多。我的理解是，对于非大型项目来说其实还好，因为，1）单个页面的请求不会包含非常多的依赖，2）基于 HTTP/2，几十个请求不算问题。但是，对于大型项目或巨型项目来说，需要考虑更合适的方案。

granularChunks 在 bigVendors 和 depPerChunk 之间取了中间值，同时又能在缓存效率上有更好的利用。无特殊场景，建议用 granularChunks 策略。

## conventionLayout

- 类型：`boolean`
- 默认值：`undefined`

`src/layouts/index.[tsx|vue|jsx|js]` 为约定式布局，默认开启。可通过配置 `conventionLayout: false` 关闭该默认行为。

## conventionRoutes

- 类型：`{ base: string; exclude: RegExp[] }`
- 默认值：`null`

修改默认的约定式路由规则，仅在使用 umi 约定式路由时有效，约定式路由也叫文件路由，就是不需要手写配置，文件系统即路由，通过目录和文件及其命名分析出路由配置。

使用约定式路由时，约定 `src/pages` 下所有的 `(j|t)sx?` 文件即路由。

> 你可以从[约定式路由](../guides/routes#约定式路由)查看更多说明。

### base

`base` 用于设置约定的路由的基础路径，默认从 `src/pages` 读取，如果是文档站点可能会需要将其改成 `./docs`；

### exclude

你可以使用 `exclude` 配置过滤一些不需要的文件，比如用于过滤 components、models 等。

示例，

```js
// 不识别 components 和 models 目录下的文件为路由
conventionRoutes: {
  exclude: [/\/components\//, /\/models\//],
}
```

## copy

- 类型：`Array<string | { from: string; to: string; }>`
- 默认值：`[]`

配置要复制到输出目录的文件或文件夹。

当配置字符串时，默认拷贝到产物目录，如：

```ts
copy: ['foo.json', 'src/bar.json']
```

会产生如下产物的结构：

```
+ dist
  - bar.json
  - foo.json
+ src
  - bar.json
- foo.json
```

你也可以通过对象配置具体的拷贝位置，其中相对路径的起点为项目根目录：

```ts
copy: [
  { from: 'from', to: 'dist/output' },
  { from: 'file.json', to: 'dist' }
]
```

此时将产生如下产物结构：

```
+ dist
  + output
    - foo.json
  - file.json
+ from
  - foo.json
- file.json
```

## crossorigin

- 类型：`{ includes?: string[] }`
- 默认值：`false`

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

## cssMinifier

- 类型：`string` 可选的值：`esbuild`, `cssnano`, `parcelCSS`, `none`
- 默认值：`esbuild`

配置构建时使用的 CSS 压缩工具; `none` 表示不压缩。

示例：

```js
{
  cssMinifier: 'esbuild'
}
```

## cssMinifierOptions

- 类型：`object`
- 默认值：`{}`

`cssMinifier` CSS 压缩工具配置选项。

示例：

```js
{
  cssMinifier: 'esbuild',
  cssMinifierOptions: {
    minifyWhitespace: true,
    minifySyntax: true,
  },
}
```

对应 CSS 压缩的配置请查看对应的文档。

- [esbuild 参考](https://esbuild.github.io/api/#minify)
- [cssnano 参考](https://cssnano.co/docs/config-file/)
- [parcelCSS 参考](https://github.com/parcel-bundler/parcel-css/blob/master/node/index.d.ts)

## cssPublicPath
- 类型：`string`
- 默认值：`./`

为 CSS 中的图片、文件等外部资源指定自定义公共路径。作用类似于 `publicPath` 默认值是 `./`。

## cssLoader

- 类型：`object`
- 默认值：`{}`

配置 css-loader ，详见 [css-loader > options](https://github.com/webpack-contrib/css-loader#options)

## cssLoaderModules

- 类型：`object`
- 默认值：`{}`

配置 css modules 的行为，详见 [css-loader > modules](https://github.com/webpack-contrib/css-loader#modules)。

如：

```ts
cssLoaderModules: {
  // 配置驼峰式使用
  exportLocalsConvention: 'camelCase'
}
```

## deadCode

- 类型：`{ patterns?: string[]; exclude?: string[]; failOnHint?: boolean; detectUnusedFiles?: boolean; detectUnusedExport?: boolean; context?: string }`
- 默认值：`false`

检测未使用的文件和导出，仅在 build 阶段开启。

比如：

```
deadCode: {}
```

然后执行 build，如有发现问题，会打印警告：

```
Warning: There are 1 unused files:
 1. /pages/index.module.less
 Please be careful if you want to remove them (¬º-°)¬.
```

可配置项：

 - `patterns` : 识别代码的范围，如 `['src/pages/**']`
 - `exclude` : 排除检测的范围，如 `['src/pages/utils/**']`
 - `failOnHint` : 检测失败是否终止进程，默认 `false` 不终止
 - `detectUnusedFiles` : 是否检测未使用的文件，默认 `true` 检测
 - `detectUnusedExport` : 是否检测未使用的导出，默认 `true` 检测
 - `context` : 匹配开始的目录，默认为当前项目根目录

## define

- 类型：`Record<string, string>`
- 默认值： 如下 

```
  { 
    'process.env.NODE_ENV' : process.env.NODE_ENV,
    'process.env.HMR' : process.env.HMR, 
    'process.env.SOCKET_SERVER': process.env.ERROR_OVERLAY' 
  }
```

基于[define-plugin 插件](https://webpack.js.org/plugins/define-plugin/)设置代码中的可用变量。

:::warning{title=🚨}
1. 属性值会经过一次 `JSON.stringify` 转换。
2. key 值的替换是通过语法形式来匹配的，比如配置了 `{'a.b.c': 'abcValue'}` 是无法替换代码中的  `a.b?.c` 的
:::

比如，

```
define: { FOO: 'bar' }
```

然后代码里的 `console.log(hello, FOO)` 会被编译成 `console.log(hello, 'bar')`。

当你在 ts 的项目中使用这些变量时，你需要在 typings 文件中声明变量类型，以支持 ts 类型提示，比如：

如果你的 typings 文件是全局的：

```ts
// typings.d.ts
declare const FOO: string;
```

如果你的 typings 文件是非全局的（包含了 import/export）：

```ts
// typings.d.ts
import './other.d.ts';

declare global {
 const FOO: string;
}
```
## devtool

- 类型：`string`
- 默认值：dev 时默认 `cheap-module-source-map`，build 时候默认无 sourcemap

设置 sourcemap 生成方式。

常见可选值有：

- `eval`，最快的类型，缺点是不支持低版本浏览器
- `source-map`，最慢但最全的类型

示例，

```js
// 关闭 dev 阶段的 sourcemap 生成
devtool: false;

// 只设置 dev 阶段的 sourcemap
devtool: process.env.NODE_ENV === 'development' ? 'eval' : false;
```

## classPropertiesLoose
- 类型：`object`
- 默认值：`{}`

设置 babel class-properties 启用 loose

## esbuildMinifyIIFE

- 类型：`boolean`
- 默认值：`false`

修复 esbuild 压缩器自动引入的全局变量导致的命名冲突问题。

由于 Umi 4 默认使用 esbuild 作为压缩器，该压缩器会自动注入全局变量作为 polyfill ，这可能会引发 异步块全局变量冲突、 qiankun 子应用和主应用全局变量冲突 等问题，通过打开该选项或切换 [`jsMinifier`](#jsminifier-webpack) 压缩器可解决此问题。

更多信息详见 [vite#7948](https://github.com/vitejs/vite/pull/7948) 。

示例,
```ts
esbuildMinifyIIFE: true
```

## externals

- 类型：`Record<string, string> | Function`
- 默认值：`{}`

设置哪些模块不打包，转而通过 `<script>` 或其他方式引入，通常需要搭配 headScripts 配置使用。

示例，

```
// external react
externals: { react: 'React' },
headScripts: ['https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.production.min.js'],
```

注意：不要轻易设置 antd 的 externals，由于依赖较多，使用方式复杂，可能会遇到较多问题，并且一两句话很难解释清楚。

## extraBabelIncludes

- 类型：`Array<string | RegExp>`
- 默认值：`[]`

配置额外需要做 Babel 编译的 NPM 包或目录。比如：

```js
export default {
  extraBabelIncludes: [
    // 支持绝对路径
    join(__dirname, '../../common'),
    // 支持 npm 包
    'react-monaco-editor',
    // 转译全部路径含有 @scope 的包
    /@scope/
  ],
};
```

## extraBabelPlugins

- 类型：`string[] | Function`
- 默认值：`[]`

配置额外的 babel 插件。可传入插件地址或插件函数。

## extraBabelPresets

- 类型：`string[] | Function`
- 默认值：`[]`

配置额外的 babel 插件集。可传入插件集地址或插件集函数。

## extraPostCSSPlugins

- 类型：`PostCSSPlugin[]`
- 默认值：`[]`

配置额外的 postcss 插件。

## exportStatic

- 类型：`{ extraRoutePaths: IUserExtraRoute[] | (() => IUserExtraRoute[] | Promise<IUserExtraRoute[]>), ignorePreRenderError: boolean }`
- 默认值：`undefined`

开启该配置后会针对每个路由单独输出 HTML 文件，通常用于静态站点托管。例如项目有如下路由：

```bash
/
/docs
/docs/a
```

不开启 `exportStatic` 时会输出：

```bash
dist/index.html
```

开启 `exportStatic` 时会输出：

```bash
dist/index.html
dist/docs/index.html
dist/docs/a/index.html
```

通过 `extraRoutePaths` 子配置项可以产出额外的页面，通常用于动态路由静态化。例如有如下路由：

```bash
/news/:id
```

默认情况下只会输出 `dist/news/:id/index.html`，但可以通过配置 `extraRoutePaths` 将其静态化：

```ts
// .umirc.ts
export default {
  exportStatic: {
    // 配置固定值
    extraRoutePaths: ['/news/1', '/news/2'],
    // 也可以配置函数动态获取
    extraRoutePaths: async () => {
      const res = await fetch('https://api.example.com/news');
      const data = await res.json();
      return data.map((item) => `/news/${item.id}`);
    },
  },
}
```

此时输出文件会变成：

```bash
dist/news/:id/index.html
dist/news/1/index.html
dist/news/2/index.html
```

`extraRoutePaths` 除了支持配置字符串数据，还可以配置成对象数组，用于启用 SSR 时又希望对部分路由禁用预渲染的场景，例如：

```ts
// .umirc.ts
export default {
  exportStatic: {
    // 输出额外页面文件但跳过预渲染
    extraRoutePaths: [{ path: '/news/1', prerender: false }],
  },
}
```

`exportStatic` 在搭配 `ssr` 使用时会进行预渲染，在预渲染失败时会抛出异常并终止构建，可以通过配置 `ignorePreRenderError` 来忽略预渲染失败的错误，例如：

```ts
// .umirc.ts
export default {
  exportStatic: {
    // 忽略预渲染失败的错误
    ignorePreRenderError: true,
  },
}
```

## favicons

- 类型：`string[]`
- 默认值：`null`

默认情况下，站点将使用约定 [`favicon`](../guides/directory-structure#favicon) 来创建图标的 meta 头标签。

通过如下方式自定义：

```js
favicons: [
  // 完整地址
  'https://domain.com/favicon.ico',
  // 此时将指向 `/favicon.png` ，确保你的项目含有 `public/favicon.png`
  '/favicon.png'
]
```

## forget

- 类型：`{ ReactCompilerConfig: object }`
- 默认值：`null`

是否开启 React Compiler（React Forget）功能。参考 https://react.dev/learn/react-compiler 。

```ts
forget: {
  ReactCompilerConfig: {},
},
```

注意：

1、forget 和 mfsu、mako 暂时不兼容，如果开启了 forget，同时 mfsu、mako 有打开时会抛错。
2、forget 需要 react 19，使用时，请手动安装 react@rc 和 react-dom@rc 到项目依赖。

## forkTSChecker

- 类型：`object`
- 默认值：`null`

开启 TypeScript 的类型检查。基于 fork-ts-checker-webpack-plugin，配置项可参考 [fork-ts-checker-webpack-plugin 的 Options](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options)。

## hash

- 类型：`boolean`
- 默认值：`false`

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

- 类型：`string[] | Script[]`
- 默认值：`[]`

配置 `<head>` 中的额外 script。

比如，

```js
headScripts: [`alert(1);`, `https://a.com/b.js`],
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
],
```

## helmet

- 类型：`boolean`
- 默认值：`true`

配置 `react-helmet-async` 的集成，当设置为 `false` 时，不会集成 `react-helmet-async`，此时无法从框架中 `import { Helmet }` 使用，同时构建产物也会减少[相应的尺寸](https://bundlephobia.com/package/react-helmet-async)。

## history

- 类型：`{ type: 'browser' | 'hash' | 'memory' }`
- 默认值：`{ type: 'browser' }`

设置路由 history 类型。

## historyWithQuery

- 类型：`‌{}`
- 默认值：`false`

让 history 带上 query。除了通过 `useNavigate` 进行的跳转场景，此时还需自行处理 query。

## https

- 类型：`{ cert: string; key: string; hosts: string[]; http2?: boolean }`
- 默认值：`{ hosts: ['127.0.0.1', 'localhost'] }`

开启 dev 的 https 模式，Umi 4 默认使用 [`mkcert`](https://github.com/FiloSottile/mkcert) 快捷创建证书，请确保已经安装。

关于参数。

- `cert` 和 `key` 分别用于指定 cert 和 key 文件。
- `hosts` 用于指定要支持 https 访问的 host，默认是 `['127.0.0.1', 'localhost']`。
- `http2` 用于指定是否使用 HTTP 2.0 协议，默认是 true（使用 HTTP 2.0 在 Chrome 或 Edge 浏览器中中有偶然出现 `ERR_HTTP2_PROTOCOL_ERRO`报错，如有遇到，建议配置为 false）。

示例，

```js
https: {
}
```

## icons

- 类型：`{ autoInstall: {}; alias: Record<string,string>; include: Array<string>;  }`
- 默认值：`false`

你就可以通过 umi 导出的 Icon 组件快捷地引用 icon 集或者本地的 icon。

### icon 集使用

在 umi 配置文件设置，开启 icons 功能，并允许自动安装图标库。

```ts
icons: { autoInstall: {} },
```

页面使用：

```ts
import { Icon } from 'umi';
<Icon icon="fa:home" />
```

icon 里包含的字符串是 `collect:icon` 的组合，以 `:` 分割。Icon 集推荐在 [Icônes 网站](https://icones.js.org/)上搜索。

## 本地 icon 使用

在 umi 配置文件设置，开启 icons 功能。

```ts
icons: {},
```

本地 svg icon 的使用需要把 svg 保存在 `src/icons` 目录下，然后通过 `local` 这个前缀引用，比如在 `src/icons` 目录下有个 `umi.svg`，然后可以这样引用。

```tsx
import { Icon } from 'umi';
<Icon icon="local:umi" />
```

### 配置项介绍

- `autoInstall` 表示是否自动安装 icon 集；tnpm/cnpm 客户端暂不支持，但可以通过手动按需安装对应 icon 集合包 `@iconify-json/collection-name` 。 参考：[Icon 集合列表](https://github.com/iconify/icon-sets/blob/master/collections.md), collection-name 为列表中的 ***Icon set prefix*** 项。
- `alias` 用于配置 icon 的别名，比如配置了 `alias:{home:'fa:home'}` 后就可以通过 `icon="home"` 使用 `fa:home` 这个 icon 了。
- `include` 配置需要强制使用的 icon， 例如 `include: ['fa:home', 'local:icon']`。常见的使用场景：将 icon 字符串定义在一个 map 中，导致无法检测到；在 `mdx` 使用了 `Icon` 组件。

### Icon 组件属性

- icon，指定 icon
- width，svg 宽度
- height，svg 高度
- viewBox，svg viewBox
- style，外部容器样式
- className，外部容器样式名
- spin，是否自动旋转
- rotate，配置旋转角度，支持多种格式，比如 `1`，`"30deg"`、`"25%"` 都可以
- flip，支持 `vertical`、`horizontal`，或者他们的组合 `vertical,horizontal`

## ignoreMomentLocale

- 类型：`boolean`
- 默认值：`true`

忽略 moment 的 locale 文件，用于减少产物尺寸。

注意：此功能默认开。配置 `ignoreMomentLocale: false` 关闭。

## inlineLimit

- 类型：`number`
- 默认值：`10000` (10k)

配置图片文件是否走 base64 编译的阈值。默认是 10000 字节，少于他会被编译为 base64 编码，否则会生成单独的文件。

## jsMinifier (webpack)

- 类型：`string`，可选值 `esbuild`, `terser`, `swc`, `uglifyJs`, `none`
- 默认值：`esbuild`

配置构建时压缩 JavaScript 的工具；`none`表示不压缩。

示例：

```ts
{
  jsMinifier: 'esbuild'
}
```

## jsMinifierOptions

- 类型：`object`
- 默认值：`{}`

`jsMinifier` 的配置项；默认情况下压缩代码会移除代码中的注释，可以通过对应的 `jsMinifier` 选项来保留注释。

示例：
```js
{
  jsMinifier: 'esbuild',
  jsMinifierOptions: {
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  }
}
```

配置项需要和所使用的工具对应，具体参考对应文档：

- [esbuild 参考](https://esbuild.github.io/api/#minify)
- [terser 参考](https://terser.org/docs/api-reference#minify-options)
- [swc 参考](https://swc.rs/docs/configuration/minification#configuration)
- [uglifyJs 参考](https://lisperator.net/uglifyjs/compress)

## lessLoader

- 类型：`object`
- 默认值：`{ modifyVars: userConfig.theme, javascriptEnabled: true }`

设置 less-loader 的 Options。具体参考参考 [less-loader 的 Options](https://github.com/webpack-contrib/less-loader#lessoptions)。

> 默认是用 less@4 版本，如果需要兼容 less@3 请配置使用[less-options-math](https://lesscss.org/usage/#less-options-math)。

## legacy

- 类型：`{ buildOnly?: boolean; nodeModulesTransform?: boolean; checkOutput?: boolean; }`
- 默认值：`false`

当你需要兼容低版本浏览器时，可能需要该选项，开启后将默认使用 **非现代** 的打包工具做构建，这会显著增加你的构建时间。

```ts
legacy: {}
```

默认只在构建时生效，通过设定 `buildOnly: false` 关闭该限制。

可通过打开 `checkOutput: true` 选项，每次构建结束后将自动运行 [`es-check`](https://github.com/yowainwright/es-check) 检查产物 `.js` 文件的语法是否为 es5 格式。

开启此选项后：

 - 不支持自定义 `srcTranspiler` 、`jsMinifier` 、 `cssMinifier` 选项。
 - 将转译全部 `node_modules` 内的源码，`targets` 兼容至 ie 11 ，通过指定 `nodeModulesTransform: false` 来取消对 `node_modules` 的转换，此时你可以通过配置 `extraBabelIncludes` 更精准的转换那些有兼容性问题的包。
 - 因低版本浏览器不支持 Top level await ，当你在使用 `externals` 时，确保你没有在使用异步性质的 [`externalsType`](https://webpack.js.org/configuration/externals/#externalstype) 时又使用了同步导入依赖。

## links

- 类型：`Link[]`
- 默认值：`[]`

配置额外的 link 标签。

示例，

```js
links: [{ href: '/foo.css', rel: 'preload' }],
```

## mako <Badge>4.3.2+</Badge>

- 类型: `{ plugins?: Array<{ load?: ((...args: any[]) => unknown) | undefined; generateEnd?: ((...args: any[]) => unknown) | undefined; }> | undefined; px2rem?: { root?: number | undefined; propBlackList?: Array<string> | undefined; propWhiteList?: Array<string> | undefined; selectorBlackList?: Array<string> | undefined; selectorWhiteList?: Array<string> | undefined; selectorDoubleList?: Array<string> | undefined; } | undefined; experimental?: { webpackSyntaxValidate?: Array<string> | undefined; } | undefined; flexBugs?: boolean | undefined; moduleIdStrategy?: string | undefined; optimization?: { skipModules?: boolean | undefined; } | undefined; }`
- 默认值: `{}`

使用 [mako](https://makojs.dev/) 用于编译以显著提高构建速度。
通过配置以启用这个能力，配置将传递给mako。这里只提供了一些常用的配置，更多的配置可以在 `mako.config.json` 文件中设置。有关更多信息，请参阅[mako-config文档](https://makojs.dev/docs/config)。

## manifest

- 类型：`{ fileName: string; basePath: string }`
- 默认值：`null`

开启 build 时生成额外的 manifest 文件，用于描述产物。

关于参数。`fileName` 是生成的文件名，默认是 `asset-manifest.json`；`basePath` 会给所有文件路径加上前缀。

注意：只在 build 时生成。

## mdx

- 类型：`{ loader: string; loaderOptions: Object }`
- 默认值：`{}`

mdx loader 配置 loader 配置路径，[loaderOptions](https://github.com/mdx-js/mdx/blob/v1/packages/mdx/index.js#L12) 配置参数

## metas

- 类型：`Meta[]`
- 默认值：`[]`

配置额外的 meta 标签。

比如，

```js
metas: [
  { name: 'keywords', content: 'umi, umijs' },
  { name: 'description', content: 'React framework.' },
],
```

会生成以下 HTML，

```html
<meta name="keywords" content="umi, umijs" />
<meta name="description" content="React framework." />
```

## mfsu

- 类型：`{ esbuild: boolean; mfName: string; cacheDirectory: string; strategy: 'normal' | 'eager'; include?: string[]; chainWebpack: (memo, args) => void; exclude?: Array<string | RegExp> }`
- 默认值：`{ mfName: 'mf', strategy: 'normal' }`

配置基于 [Module Federation](https://module-federation.github.io/) 的提速功能。

关于参数

- `esbuild` 配为 `true` 后会让依赖的预编译走 esbuild，从而让首次启动更快，缺点是二次编译不会有物理缓存，稍慢一些；推荐项目依赖比较稳定的项目使用。
- `mfName` 是此方案的 remote 库的全局变量，默认是 mf，通常在微前端中为了让主应用和子应用不冲突才会进行配置
- `cacheDirectory` 可以自定义缓存目录，默认是 `node_modules/.cache/mfsu`
- `chainWebpack` 用链式编程的方式修改 依赖的 webpack 配置，基于 webpack-chain，具体 API 可参考 [webpack-api 的文档](https://github.com/sorrycc/webpack-chain)；
- `runtimePublicPath` 会让修改 mf 加载文件的 publicPath 为 `window.publicPath`
- `strategy` 指定 mfsu 编译依赖的时机; `normal` 模式下，采用 babel 编译分析后，构建 Module Federation 远端包；`eager` 模式下采用静态分析的方式，和项目代码同时发起构建。
- `include` 仅在 `strategy: 'eager' ` 模式下生效， 用于补偿在 eager 模式下，静态分析无法分析到的依赖，例如 `react` 未进入 Module Federation 远端模块可以这样配置 `{ include: [ 'react' ] }`
- `exclude` 手动排除某些不需要被 MFSU 处理的依赖, 字符串或者正则的形式，比如 `vant` 不希望走 MFSU 处理，可以配置 `{ exclude: [ 'vant' ] }` 匹配逻辑为全词匹配，也可以配置 `{ exclude: [ /vant/ ] }` 只要 `import` 路径中匹配该正则的依赖都不走 MFSU 处理

示例，

```js
// 用 esbuild 做依赖预编译
mfsu: {
  esbuild: true,
}

// 关闭 mfsu 功能
mfsu: false;
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

- 类型：`{ exclude: string[], include: string[] }`
- 默认值：`{}`

配置 mock 功能。

关于参数。`exclude` 用于排除不需要的 mock 文件；`include` 用于额外添加 mock 目录之外的 mock 文件。

示例，

```js
// 让所有 pages 下的 _mock.ts 文件成为 mock 文件
mock: {
  include: ['src/pages/**/_mock.ts'],
}
```

注意：此功能默认开。配置 `mock: false` 关闭。

## mountElementId

- 类型：`string`
- 默认值：`'root'`

配置 react 组件树渲染到 HTML 中的元素 id。

示例，

```js
mountElementId: 'container'
```

## monorepoRedirect

- 类型：`{ srcDir?: string[], exclude?: RegExp[], peerDeps?: boolean, useRootProject?: boolean }`
- 默认值：`false`

在 monorepo 中使用 Umi 时，你可能需要引入其他子包的组件、工具方法等，通过开启此选项来重定向这些子包的导入到他们的源码位置（默认为 `src` 文件夹），这也可以解决 `MFSU` 场景改动子包不热更新的问题。

这种重定向的好处是：支持热更新，无需预构建其他子包即可进行开发。

通过配置 `srcDir` 来调整识别源码文件夹的优先位置，通过 `exclude` 来设定不需要重定向的依赖范围。

示例：

```js
// 默认重定向到子包的 src 文件夹
monorepoRedirect: {}
// 在子包中寻找，优先定向到 libs 文件夹
monorepoRedirect: {
  srcDir: ['libs', 'src'],
}
// 不重定向 @scope/* 的子包
monorepoRedirect: {
  exclude: [/^@scope\/.+/],
}
```

在实际的大型业务 monorepo 中，每个子包的依赖都是从他们的目录开始向上寻找 `node_modules` 并加载的，但在本地开发时，依赖都安装在 `devDependencies` ，和从 npm 上安装表现不一致，所以不可避免会遇到多实例问题。

:::info
举个例子，每个子包在本地开发时都需要 `antd` ，在 `devDependencies` 中安装了，也在 `peerDependencies` 中指明了 `antd` ，我们预期该包发布到 npm ，被某个项目安装后， `antd` 是使用的项目本身的依赖，全局唯一，但由于在 monorepo 中，指定在 `devDependencies` 中的依赖必定存在，且子包代码寻找依赖时是从该子包进行的，导致了每个子包都用了自己的 `antd` ，出现了产物中有多份 `antd` 、产物体积增大、消息队列被破坏等情况。
:::

为了解决这种问题，我们约定：

当打开 `peerDeps` 选项时，所有子包指明的 `peerDependencies` 都会被自动添加 `alias` 重定向唯一化，避免多实例的存在：

```ts
monorepoRedirect: { peerDeps: true }
```

经过重定向，依赖全局唯一，便可以在开发时保持和在 npm 上安装包后的体验一致。

useRootProject: 当你的项目不在 monorepo 子文件夹里，而在 monorepo 根的话，你可以开启这个选项，以使 monorepoRedirect 生效。

## mpa

- 类型：`object`
- 默认值：`false`

启用 [mpa 模式](../guides/mpa)。

## outputPath

- 类型：`string`
- 默认值：`dist`

配置输出路径。

注意：不允许设定为 src、public、pages、mock、config、locales、models 等约定式功能相关的目录。

## phantomDependency

- 类型：`{ exclude: string[] }`
- 默认值：`false`

执行幽灵依赖检测。

当使用未在 package.json 中声明的依赖，以及也没有通过 alias 或 externals 进行配置时，会抛错并提醒。

![](https://mdn.alipayobjects.com/huamei_ddtbzw/afts/img/A*k5uoQ5TOPooAAAAAAAAAAAAADkCKAQ/original)

如遇到有需要需做白名单处理，可通过 exclude 配置项实现，exclude 的项是 npm 依赖的包名。

```ts
export default {
  phantomDependency: {
    exclude: ['lodash']
  }
}
```

## plugins

- 类型：`string[]`
- 默认值：`[]`

配置额外的 Umi 插件。

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

- 类型：`{ imports: string[] }`
- 默认值：`{}`

设置按需引入的 polyfill。默认全量引入。

比如只引入 core-js 的 stable 部分，

```js
polyfill: {
  imports: ['core-js/stable'],
}
```

如果对于性能有更极致的要求，可以考虑按需引入，

```js
polyfill: {
  imports: ['core-js/features/promise/try', 'core-js/proposals/math-extensions'],
}
```

注意：此功能默认开。配置 `polyfill: false` 或设置环境变量 `BABEL_POLYFILL=none` 关闭。

## postcssLoader

- 类型：`object`
- 默认值：`{}`

设置 [postcss-loader 的配置项](https://github.com/webpack-contrib/postcss-loader#options)。

## presets

- 类型：`string[]`
- 默认值：`[]`

配置额外的 Umi 插件集。

数组项为指向插件集的路径，可以是 npm 依赖、相对路径或绝对路径。如果是相对路径，则会从项目根目录开始找。

示例，

```js
presets: [
  // npm 依赖
  'umi-preset-hello',
  // 相对路径
  './preset',
  // 绝对路径
  `${__dirname}/preset.js`,
],
```

## proxy

- 类型：`object`
- 默认值：`{}`

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

- 类型：`string`
- 默认值：`/`

配置 webpack 的 publicPath。

## reactRouter5Compat

- 类型：`object`
- 默认值：`false`

启用 react-router 5 兼容模式。此模式下，路由组件的 props 会包含 location、match、history 和 params 属性，和 react-router 5 的保持一致。

但要注意的是，

1. 此模式下会有额外的 re-render
2. 由于依赖库 history 更新，location 中依旧没有 query 属性

## routes

- 类型：`Route[]`
- 默认值：`[]`

配置路由。更多信息，请查看 [配置路由](../guides/routes#配置路由)

## routeLoader

- 类型：`{ moduleType: 'esm' | 'cjs' }`
- 默认值：`{ moduleType: 'esm' }`

配置路由加载方式。moduleType 配置为 'cjs' 会用 `require` 的方式加载路由组件。

```ts
// moduleType: esm
'index': React.lazy(() => import(/* webpackChunkName: "p__index" */'../../pages/index.tsx')),

// moduleType: cjs
'index': React.lazy(() => Promise.resolve(require('../../pages/index.tsx'))),
```

## routePrefetch

- 类型：`{ defaultPrefetch: 'none' | 'intent' | 'render' | 'viewport', defaultPrefetchTimeout: number } | false`
- 默认值：`false`

启用路由预加载功能。

## run

- 类型：`{ globals: string[] }`
- 默认值：`null`

run 命令的全局注入配置。添加`['zx/globals']`，在使用`umi run ./script.ts`的时候，umi会自动注入`import 'zx/globals';`，从而省略掉每个脚本都要写`import 'zx/globals';`。

## runtimePublicPath

- 类型：`object`
- 默认值：`null`

启用运行时 publicPath，开启后会使用 `window.publicPath` 作为资源动态加载的起始路径。

比如，

```js
runtimePublicPath: {},
```

## scripts

- 类型：`string[] | Script[]`
- 默认值：`[]`

配置 `<body>` 中额外的 script 标签。

比如，

```js
scripts: [`alert(1);`, `https://a.com/b.js`],
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
],
```

## sassLoader

- 类型：`object`
- 默认值：`{}`

配置 sass-loader ，详见 [sass-loader > options](https://github.com/webpack-contrib/sass-loader#options)

## styleLoader

- 类型：`object`
- 默认值：`false`

启用 style loader 功能，让 CSS 内联在 JS 中，不输出额外的 CSS 文件。

## stylusLoader
- 类型：`object`
- 默认值：`{}`

配置 stylus-loader ，详见 [stylus-loader > options](https://github.com/webpack-contrib/stylus-loader#options)

## styles

- 类型：`string[]`
- 默认值：`[]`

配置额外的 CSS。

配置项支持内联样式和外联样式路径，后者通过是否以 https?:// 开头来判断。

插入的样式会前置，优先级低于项目内用户编写样式。

比如：

```js
styles: [`body { color: red; }`, `https://a.com/b.css`],
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

## stagewise

- 类型：`Record<string, any>`
- 默认值：`undefined`

配置 Stagewise 插件。Stagewise 是一个开发调试工具，仅在开发模式下生效。

示例：

```ts
// .umirc.ts
export default {
  stagewise: {
    // Stagewise 工具栏配置
    theme: 'dark',
    position: 'bottom-right',
  },
};
```

更多配置选项详见 [Stagewise 配置文档](https://kmi.corp.kuaishou.com/plugins/stagewise)。

注意：此功能需要通过配置启用。

## srcTranspiler

- 类型：`string` 可选的值：`babel`, `swc`, `esbuild`
- 默认值：`babel`

配置构建时转译 js/ts 的工具。

## srcTranspilerOptions

- 类型：`{ swc?: SwcConfig, esbuild?: EsbuildConfig }`
- 默认值：`undefined`

如果你使用了 `swc` / `esbuild` 作为 `srcTranspiler` 转译器，你可以通过此选项对转译器做进一步的配置，详见 [SwcConfig](https://swc.rs/docs/configuration/swcrc) 、 [EsbuildConfig](https://esbuild.github.io/api/#transform-api) 配置文档。

如给 swc 添加其他的插件：

```ts
srcTranspilerOptions: {
  swc: {
    jsc: {
      experimental: {
        plugins: [
          [
            '@swc/plugin-styled-components',
            {
              displayName: true,
              ssr: true,
            },
          ],
        ],
      },
    },
  },
}
```

## svgr

- 类型：`object`
- 默认值：`{}`

svgr 默认开启，支持如下方式使用 React svg 组件：

```ts
import SmileUrl, { ReactComponent as SvgSmile } from './smile.svg';
```

可配置 svgr 的行为，配置项详见 [@svgr/core > Config](https://github.com/gregberge/svgr/blob/main/packages/core/src/config.ts#L9)。

## svgo

- 类型：`object`
- 默认值：`{}`

默认使用 svgo 来优化 svg 资源，配置项详见 [svgo](https://github.com/svg/svgo#configuration) 。

## targets

- 类型：`object`
- 默认值：`{ chrome: 80 }`

配置需要兼容的浏览器最低版本。Umi 会根据这个自定引入 polyfill、配置 autoprefixer 和做语法转换等。

示例，

```js
// 兼容 ie11
targets: {
  ie: 11,
}
```

## theme

- 类型：`object`
- 默认值：`{}`

配置 less 变量主题。

示例：

```js
theme: { '@primary-color': '#1DA57A' }
```

## title

- 类型：`string`
- 默认值：`null`

配置全局页面 title，暂时只支持静态的 Title。

## transformRuntime

- 类型：`{ absoluteRuntime: string, version: string }`
- 默认值：`{}`

配置 transform-runtime 插件的部分功能。

比如，如果你想用最新的 @babel/runtime 版本。可先配置如下：

```js
transformRuntime: {
  absoluteRuntime: process.cwd(),
}
```

再安装 @babel/runtime 到项目中：

```bash
$ npm install @babel/runtime --save-dev
```

## utoopack <Badge>4.6.0+</Badge>

- 类型: `Object`
- 默认值: `{}`

使用 Rust Bundler [utoopack](http://github.com/utooland/utoo) 用于提升构建性能。

通过配置来启用这个能力，目前 utoopack 对框架中大部分功能已经支持。

## verifyCommit

- 类型：`{ scope: string[]; allowEmoji: boolean }`
- 默认值：`{ scope: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'workflow', 'build', 'ci', 'chore', 'types', 'wip', 'release', 'dep', 'deps', 'example', 'examples', 'merge', 'revert'] }`

针对 verify-commit 命令的配置项。

关于参数。`scope` 用于配置允许的 scope，不区分大小写，配置后会覆盖默认的；`allowEmoji` 开启后会允许加 EMOJI 前缀，比如 `💥 feat(模块): 添加了个很棒的功能`。

```
verifyCommit: {
  scope: ['feat', 'fix'],
  allowEmoji: true,
}
```

注意：使用 `git revert` 或 `git merge` 命令以及 `changesets` 的发版 merge 格式所产生的 commit message 会默认通过校验。

## vite

- 类型：`object`
- 默认值：`{}`

开发者的配置会 merge 到 vite 的 [默认配置](https://vitejs.dev/config/)。

示例，

```js
// 更改临时文件路径到 node_modules/.bin/.vite 文件夹
vite: {
  cacheDir: 'node_modules/.bin/.vite',
}
```

## writeToDisk

- 类型：`boolean`
- 默认值：`false`

开启后会在 dev 模式下额外输出一份文件到 dist 目录，通常用于 chrome 插件、electron 应用、sketch 插件等开发场景。
