# umi-library

Library toolkit based on rollup and docz.

[![NPM version](https://img.shields.io/npm/v/umi-library.svg?style=flat)](https://npmjs.org/package/umi-plugin-library)
[![NPM downloads](http://img.shields.io/npm/dm/umi-library.svg?style=flat)](https://npmjs.org/package/umi-library)

## Features

* ✔︎ 基于 [docz](https://www.docz.site/) 的文档功能
* ✔︎ 基于 [rollup](http://rollupjs.org/) 和 babel 的组件打包功能
* ✔︎ 支持 TypeScript
* ✔︎ 支持 cjs、esm 和 umd 三种格式的打包
* ✔︎ esm 支持生成 mjs，直接为浏览器使用
* ✔︎ 支持用 babel 或 rollup 打包 cjs 和 esm
* ✔︎ 支持多 entry
* ✔︎ 支持 lerna
* ✔︎ 支持 css 和 less，支持开启 css modules

## Installation

Install umi-library via yarn or npm.

```bash
$ yarn add umi-library
```

## Usage

```bash
# Bundle library
$ umi-library build

# umi-lib is the alias for umi-library
$ umi-lib build

# dev the doc
$ umi-lib doc dev

# build doc
$ umi-lib doc build

# deploy doc to github.io
$ umi-lib doc deploy
```

## Cli

### build

打包库，输出多种格式的文件。

```bash
# Normal build
$ umi-lib build

# Bundle src/foo.js with esm=rollup, cjs=rollup and umd, and specify the output filename with bar
$ umi-lib build --esm --cjs --umd --file bar src/foo.js
Success!
$ tree ./dist
./dist
  - bar.js
  - bar.esm.js
  - bar.umd.js
  - bar.umd.min.js
```

### doc

doc 包含 dev 和 build 两个子命令。

```bash
$ umi-lib doc dev
$ umi-lib doc build
$ umi-lib doc deploy
```

所有的命令行参数会透传给 docz，详见 [docz.site#project-configuration](https://www.docz.site/documentation/project-configuration)。

注：

1. 不能传 `--config` 参数，通过 `--config` 指定的文件内容可全部配置在 `.umirc.library.js` 的 [doc](#doc) 配置里。
2. 使用 `deploy` 之前请先执行 `build` 命令，文档部署后域名为：`https://yourname.github.io/your-repo`。

## Config

新建 `.umirc.library.js` 文件进行配置。

比如：

```js
export default {
  entry: 'src/foo.js',
  doc: {
    themeConfig: { mode: 'dark' },
    base: '/your-repo'
  },
}
```

注意：

1. lerna 项目可以为每个 package 单独配，并且可以继承根目录的 `.umirc.library.js` 配置
2. 配置文件支持 es6 和 TypeScript

### Options

#### entry

指定入口文件。

* Type: `string | string[]`
* Default：`src/index.js`

注：事实上，我们会依次找 `src/index.tsx`, `src/index.ts`, `src/index.jsx`, `src/index.js`，如果存在，则会作为默认的 entry。

#### file

指定输出文件。

* Type: `string`
* Default: 与 entry 相同的文件名，esm 会加 `.esm.js` 后缀，umd 会加 `.umd[.min].js` 后缀

注：

1. entry 为数组时，不可配置 file，因为不能多个 entry 输出到同一个文件
2. 为不同 entry 指定不同的输出文件名时，可通过 [overridesByEntry](#overridesbyentry) 实现

#### esm

是否输出 esm 格式，以及指定 esm 格式的打包方式等。

* Type: `"rollup" | "babel" | { type, file, mjs } | false`
* Default: `false`

esm 为 `rollup` 或 `babel` 时，等同于配置了 `{ type: "rollup" | "babel" }`。

#### esm.type

指定 esm 的打包类型，可选 `rollup` 或 `babel`。

* Type: `"rollup" | "babel"`
* Default: `undefined`

#### esm.file

指定 esm 的输出文件名。

* Type: `string`
* Default: `undefined`

#### esm.mjs

是否同时输出一份给浏览器用的 esm，以 `.mjs` 为后缀。

* Type: `boolean`
* Default: `false`

注：

1. mjs 目前不通用，除非你知道这是什么，否则不要配置。

#### cjs

是否输出 cjs 格式，以及指定 cjs 格式的打包方式等。

- Type: `"rollup" | "babel" | { type, file } | false`
- Default: `false`

cjs 为 `rollup` 或 `babel` 时，等同于配置了 `{ type: "rollup" | "babel" }`。

#### cjs.type

指定 cjs 的打包类型，可选 `rollup` 或 `babel`。

- Type: `"rollup" | "babel"`
- Default: `undefined`

#### cjs.file

指定 cjs 的输出文件名。

- Type: `string`
- Default: `undefined`

#### umd

是否输出 umd 格式，以及指定 umd 的相关配置。

* Type: `{ globals, name, minFile, file } | false`
* Default: `false`

#### umd.globals

指定 rollup 的 [globals](https://rollupjs.org/guide/en#output-globals) 配置。

#### umd.name

指定 rollup 的 [name](https://rollupjs.org/guide/en#output-name) 配置。

#### umd.minFile

是否为 umd 生成压缩后的版本。

* Type: `boolean`
* Default: `false`

#### umd.file

指定 umd 的输出文件名。

- Type: `string`
- Default: `undefined`

#### autoprefixer

配置参数传给 autoprefixer，详见 [autoprefixer#options](https://github.com/postcss/autoprefixer#options)，常用的有 `flexbox` 和 `browsers`。

比如：

```js
export default {
  autoprefixer: {
    browsers: [
      'ie>8',
      'Safari >= 6',
    ],
  },
}
```

#### cssModules

配置是否开启 css modules。

* Type: `boolean`
* Default: `false`

默认是 `.modules.css` 走 css modules，`.css` 不走 css modules。配置 `cssModules` 为 `true` 后，全部 css 文件都走 css modules。（less 文件同理）

#### extraBabelPresets

配置额外的 babel preset。

* Type: `array`
* Default: `[]`

#### extraBabelPlugins

配置额外的 babel plugin。

* Type: `array`
* Default: `[]`

比如配置 babel-plugin-import 按需加载 antd，

```js
export default {
  extraBabelPlugins: [
    ['babel-plugin-import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    }],
  ],
};
```

#### extraPostCSSPlugins

配置额外的 postcss plugin。

* Type: `array`
* Default: `[]`

#### namedExports

配置 rollup-plugin-commonjs 的 [namedExports](https://github.com/rollup/rollup-plugin-commonjs#usage)。

#### target

配置是 node 库还是 browser 库，只作用于语法层。

* Type: `"node" | "browser"`
* Default: `"browser"`

如果为 `node`，兼容到 node@6；如果为 `browser`，兼容到 `['last 2 versions', 'IE 10']`，所以肯定会是 es5 的语法。

#### runtimeHelpers

是否把 helper 方法提取到 `@babel/runtime` 里。

* Type: `boolean`
* Default: `false`

注：

1. 推荐开启，能节约不少尺寸
2. 配置了 `runtimeHelpers`，一定要在 dependencies 里有 `@babel/runtime` 依赖
3. runtimeHelpers 只对 esm 有效，cjs 下无效，因为 cjs 已经不给浏览器用了，只在 ssr 时会用到，无需关心小的尺寸差异

#### overridesByEntry

根据 entry 覆盖配置。

比如要为不同的 entry 配置不同的输出文件名，

```js
export default {
  entry: ['foo.js', 'bar.js'],
  overridesByEntry: {
    'foo.js': {
      file: 'bar',
    },
    'bar.js': {
      file: 'foo',
    },
  },
}
```

overridesByEntry 里的配置会和外面的配置进行 shadow 合并，比如：

```js
export default {
  umd: { globals: { jquery: 'window.jQuery' } }
  entry: ['foo.js', 'bar.js'],
  overridesByEntry: {
    'foo.js': {
      umd: { name: 'foo' },
    },
  },
}
```

则 `foo.js` 的 umd 配置为 `{ globals: { jquery: 'window.jQuery' }, name: 'foo' }`。

#### doc

透传配置给 [docz](https://www.docz.site/documentation/project-configuration)，可以有 `title`、`theme`、`themeConfig` 等。

比如要切换默认主题为 dark 模式：

```js
export default {
  doc: { themeConfig: { mode: 'dark' } },
}
```

## Bonus

一些小贴士：

1. 通常只要配置 `esm: "rollup"` 就够了
2. 如果要考虑 ssr，再配上 `cjs: "rollup"`
3. `package.json` 里配上 `sideEffects: false | string[]`，会让 webpack 的 tree-shaking 更高效

## LICENSE

MIT

