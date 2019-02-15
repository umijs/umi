# umi-plugin-library

## why

组件库的开发需要大量繁琐的配置来搭建开发环境，生成文档站，打包部署。同时，由于 javascript 技术栈迭代太快，要开发一个至少不落伍的包更需要大量学习和选型。

所以为了解决这个痛点，我们将积累的经验和探索的成果进行总结，开发了这个插件，旨在方便更多的开发者进行组件库的开发。如果你在使用中有感到不便，欢迎提 [issue](https://github.com/umijs/umi-plugin-library/issues)。🤓

另外，这里提到的组件库，不仅包含类似 antd 这样的 react 组件库，也可以是 umi-request 这样的工具库。

## Features

- ✔︎ 提供开箱即用的组件 (component) 和库 (library) 开发脚手架
- ✔︎ 基于 docz + umi，提供一个可以快速开始的组件开发环境
- ✔︎ 支持 mdx 语法，可以在 markdown 里写 jsx，可以很方便的组织组件 demo 与 API 文档
- ✔︎ 打包基于 rollup，专注于组件与库的打包，良好的 tree-shaking 特性可以让你的包更小，不用插件也能支持按需加载
- ✔︎ 支持 cjs，esm，umd 三种格式，让你的包可以适用于各种应用场景
- ✔︎ cjs 和 esm 格式支持 rollup 和 babel 两种打包方式
- ✔︎ 支持 lerna 多包管理方式，允许分包独立发布
- ✔︎ 支持 TypeScript

## Usage

```bash
$ # 创建目录
$ mkdir my-lib && cd my-lib

# 初始化脚手架，选择 library
$ yarn create umi

# 安装依赖
$ yarn install

# 开发
$ umi doc dev

# 打包库
$ umi lib build [--watch]

# 打包文档
$ umi doc build 

# 部署文档到 username.github.io/repo
$ umi doc deploy
```

## Tutorial

- [开发一个组件库](/zh/guide/library.html)

## Configure

Config it in `.umirc.js` or `config/config.js`,

```js
export default {
  plugins: [
      ['umi-plugin-library', options]
  ],
};
```

## Options

### `doc`

文档站相关配置

### `doc.title`

文档站标题

- Type: `string`
- Default: `${pkg.name}`

### `doc.theme`

文档站主题

- Type: `string`
- Default: `docz-theme-default`

### `doc.themeConfig`

主题的细节配置

- Type: `object`
- Default: [themeConfig](https://github.com/umijs/umi-plugin-library/blob/master/packages/umi-plugin-docz/src/defaultThemeConfig.js)

### `doc.style`

外部 css url

- Type: `string[]`
- Default: `[]`

### `doc.script`

外部 js url

- Type: `string[]`
- Default: `[]`

###  `doc.favicon`

- Type: `string`
- Default: ``

### `doc.host`

- Type: `string`
- Default: '127.0.0.1'

### `doc.port`

- Type: `number`
- Default: `8001`

### `doc.base`

build 产物里的静态资源相对路径

- Type: `string`
- Default: `/${pkg.name}/`

### `doc.hashRouter`

是否使用 hash router

- Type: `boolean`
- Default: `false`

---

### `watch`

build 时是否采用观察模式

- Type: `boolean`
- Default: `false`

### `entry`

build 入口

- Type: `string`
- Default: `src/index.*`

### `cssModules`

css modules 配置

- Type: `boolean | { camelCase?: boolean, globalModulePaths?: RegExp[] }`
- Default: `{globalModulePaths: [/global\.less$/, /global\.css$/, /node_modules/]}`

### `extraBabelPlugins`

额外的 babel 插件

- Type: `[string | [string, any?]][]`
- Default: `[]`

### `extraBabelPresets`

额外的 babel 预设集

- Type: `[string | [string, any?]][]`
- Default: `[]`

### `targets`

babel 的浏览器的配置

- Type: `[prop: string]: string | string[]`
- Default: `{ ie: 11 }`

### `extraPostCSSPlugins`

额外的 post css 插件

- Type: `any[]`
- Default: `[]`

### `namedExports`

用于解决 rollup 的 [Error: "[name] is not exported by [module]"](https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-)

- Type: `{[prop:string]: string}`
- Default: `{}`

### `esm`

es modules 包，支持 tree shaking，未来的趋势

- Type: `{type: 'rollup' | 'babel', file?: string} | false`
- Default: `{type: 'rollup', file: ${pkg.modules}}`

### `cjs`

commonjs 包，传统的包

- Type: `{type: 'rollup' | 'babel', file?: string} | false`
- Default: `{type: 'rollup', file: ${pkg.main}}`

### `umd`

umd 包，用于发布到 cdn，支持浏览器加载，默认关闭

- Type: `{globals: {[prop:string]: string}, name: string, file: string} | false`

### `umd.globals`

umd 依赖的外部包在全局中的变量名称

- Type: `{[prop:string]: string}`
- Default: `{'react': 'React', 'react-dom': 'ReactDom', 'antd': 'antd'}`

### `umd.name`

umd 包被浏览器加载后，可以通过 `window.Foo` 访问的名字

- Type: `string`
- Default: `camelCase(basename(${pkg.name}))`

### `umd.file`

umd 包文件输出路径

- Type: `string`
- Default: `${pkg.unpkg} | 'dist/index.umd.js'`

### `external`

指定外部依赖，cjs 和 esm 包默认是 external `dependencies` + `peerDependencies` + external，而 umd 包只使用 external

- Type: `string[]`
- Default: `['react', 'react-dom', 'antd']`

### `sourcemap`

- Type: `boolean`
- Default: `false`

### `copy`

build 时拷贝文件，比如拷贝一个不需要被打包的配置文件到指定目录

- Type: `{files: string[], dest: []}`
- Default: `undefined`
