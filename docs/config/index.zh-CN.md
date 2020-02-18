---
title: Config
---

以下配置项通过字母排序。

## alias

- Type: `object`
- Default: `{}`

配置别名，对引用路径进行隐射。

比如：

```js
export default {
  alias: {
    foo: '/tmp/a/b/foo',
  },
};
```

然后 `import('foo')`，实际上是 `import('/tmp/a/b/foo')`。

Umi 内置了以下别名：

- `@`，项目 src 目录
- `@@`，临时目录，通常是 `src/.umi` 目录
- `umi`，当前所运行的 umi 仓库目录
- `react-router` 和 `react-router-dom`，底层路由库，锁定版本，打包时所有依赖了他们的地方使用同一个版本
- `react` 和 `react-dom`，默认使用 `16.x` 版本，但如果项目里有依赖，会优先使用项目中依赖的版本

## autoprefixer

- Type: `object`
- Default: `{ flexbox: 'no-2009' }`

设置 [autoprefixer 的配置项](https://github.com/postcss/autoprefixer#options)。

注意：

- 不要设置 `overrideBrowserslist`，此配置被内部接管，通过 `targets` 配置项选择你要兼容的浏览器。

## base

- Type: `string`
- Default: `/`

设置路由前缀，通常用于部署到非根目录。

比如，你有路由 `/` 和 `/users`，然后设置了 base 为 `/foo/`，那么就可以通过 `/foo/` 和 `/foo/users` 访问到之前的路由。

## chainWebpack

- Type: `Function`

通过 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 的 API 修改 webpack 配置。

比如：

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // 设置 alias
    memo.resolve.alias.set('foo', '/tmp/a/b/foo');

    // 删除 umi 内置插件
    config.plugins.delete('progress');
    config.plugins.delete('friendly-error');
  },
};
```

参数有，

- memo，当前 webpack-chain 对象
- env，当前环境，`development`、`production` 或 `test` 等
- webpack，webpack 实例，用于获取其内部插件

## cssLoader

- Type: `object`
- Default: `{}`

设置 [css-loader 配置项](https://github.com/webpack-contrib/css-loader#options)。

## cssnano

- Type: `object`
- Default: `{}`

描述。

## copy

- Type: `Array(string)`
- Default: `[]`

描述。

## define

- Type: `object`
- Default: `{}`

描述。

## devServer

- Type: `object`
- Default: `{}`

描述。

## devtool

- Type: `string`
- Default: `cheap-module-source-map` in dev mode

描述。

## dynamicImport

- Type: `boolean`
- Default: `false`

描述。

## exportStatic

- Type: `object`
- Default: `{}`

描述。

## externals

- Type: `object`
- Default: `{}`

描述。

## extraBabelPlugins

- Type: `Array`
- Default: `[]`

描述。

## extraBabelPresets

- Type: `Array`
- Default: `[]`

描述。

## extraPostCSSPlugins

- Type: `Array`
- Default: `[]`

描述。

## favicon

- Type: `string`

描述。

## hash

- Type: `boolean`
- Default: `false`

描述。

## headScripts

- Type: `Array`
- Default: `[]`

描述。

## history

- Type: `object`
- Default: `{ type: 'browser' }`

描述。

## ignoreMomentLocale

- Type: `true`
- Default: `false`

描述。

## inlineLimit

- Type: `number`
- Default: `10000` (10k)

描述。

## lessLoader

- Type: `object`
- Default: `{}`

描述。

## links

- Type: `Array`
- Default: `[]`

描述。

## manifest

- Type: `object`
- Default: `{}`

描述。

## metas

- Type: `Array`
- Default: `[]`

描述。

## mountElementId

- Type: `string`
- Default: `root`

描述。

## outputPath

- Type: `string`
- Default: `dist`

描述。

## plugins

- Type: `Array(string)`
- Default: `[]`

描述。

## presets

- Type: `Array(string)`
- Default: `[]`

描述。

## proxy

- Type: `object`
- Default: `{}`

描述。

## runtimePublicPath

- Type: `boolean`
- Default: `false`

描述。

## scripts

- Type: `Array`
- Default: `[]`

描述。

## singular

- Type: `boolean`
- Default: `false`

描述。

## ssr

暂未在 umi@3 中实现。

## styleLoader

- Type: `object`
- Default: `{}`

描述。

## styles

- Type: `Array`
- Default: `[]`

描述。

## targets

- Type: `object`
- Default: `{}`

描述。

## terserOptions

- Type: `object`
- Default: `{}`

描述。

## theme

- Type: `object`
- Default: `{}`

描述。
