# umi-plugin-library

## why

The development of component libraries requires a lot of cumbersome configuration to build the development environment, generate document stations, package deployment. At the same time, because the javascript technology stack iteration is too fast, it takes a lot of learning and selection to develop a package that is at least not outdated.

So in order to solve this pain point, we have summarized the accumulated experience and the results of the exploration, and developed this plug-in, which is designed to facilitate more developers to develop component libraries. If you are inconvenienced in use, please feel free to [issue](https://github.com/umijs/umi-plugin-library/issues). 🤓

In addition, the component library mentioned here not only contains a react component library like antd, but also a tool library like umi-request.

## Features

- ✔︎ Provide out-of-the-box components and libraries to develop scaffolding
- ✔︎ Based on docz + umi, provide a component development environment that can be quickly started
- ✔︎ Support mdx syntax, you can write jsx in markdown, you can easily organize component demo and API documentation
- 打包 Packing is based on rollup, focusing on the packaging of components and libraries. Good tree-shaking features can make your package smaller, and can support on-demand loading without plugins.
- ✔︎ Supports cjs, esm, umd formats, so that your package can be applied to various application scenarios.
- ✔︎ cjs and esm formats support rollup and babel packaging
- ✔︎ Support lerna multi-package management mode, allowing sub-packages to be released independently
- ✔︎ Support for TypeScript

## Usage

```bash
$ #Create directory
$ mkdir my-lib && cd my-lib

# Initialize scaffolding, select library
$ yarn create umi

# Installation dependency
$ yarn install

# development
$ umi doc dev

# build package
$ umi lib build [--watch]

#package document
$ umi doc build

#Deploy the documentation to username.github.io/repo
$ umi doc deploy
```

## Tutorial

- [Develop a component library](/guide/library.html)

## Configure

Config it in `.umirc.js` or `config/config.js`,

```js
export default {
  Plugins: [
      ['umi-plugin-library', options]
  ],
};
```

## Options

### `doc`

Document station related configuration

### `doc.title`

Document station title

- Type: `string`
- Default: `${pkg.name}`

### `doc.theme`

Document station theme

- Type: `string`
- Default: `docz-theme-default`

### `doc.themeConfig`

Theme configuration

- Type: `object`
- Default: [themeConfig](https://github.com/umijs/umi-plugin-library/blob/master/packages/umi-plugin-docz/src/defaultThemeConfig.js)

### `doc.style`

External css url

- Type: `string[]`
- Default: `[]`

### `doc.script`

External js url

- Type: `string[]`
- Default: `[]`

### `doc.favicon`

- Type: `string`
- Default: ``

### `doc.host`

- Type: `string`
- Default: '127.0.0.1'

### `doc.port`

- Type: `number`
- Default: `8001`

### `doc.base`

Relative path of static resources in the build product

- Type: `string`
- Default: `/${pkg.name}/`

### `doc.hashRouter`

Whether to use hash router

- Type: `boolean`
- Default: `false`

---

### `watch`

Whether to use observation mode when building

- Type: `boolean`
- Default: `false`

### `entry`

Build entrance

- Type: `string`
- Default: `src/index.*`

### `cssModules`

Css modules configuration

- Type: `boolean | { camelCase?: boolean, globalModulePaths?: RegExp[] }`
- Default: `{globalModulePaths: [/global\.less$/, /global\.css$/, /node_modules/]}`

### `extraBabelPlugins`

Extra babel plugin

- Type: `[string | [string, any?]][]`
- Default: `[]`

### `extraBabelPresets`

Extra babel preset set

- Type: `[string | [string, any?]][]`
- Default: `[]`

### `targets`

Babel's browser configuration

- Type: `[prop: string]: string | string[]`
- Default: `{ ie: 11 }`

### `extraPostCSSPlugins`

Extra post css plugin

- Type: `any[]`
- Default: `[]`

### `namedExports`

[Error: "[name] is not exported by [module]"] (https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-)

- Type: `{[prop:string]: string}`
- Default: `{}`

### `esm`

Es modules package, support tree shaking, future trends

- Type: `{type: 'rollup' | 'babel', file?: string} | false`
- Default: `{type: 'rollup', file: ${pkg.modules}}`

### `cjs`

Commonjs package, traditional package

- Type: `{type: 'rollup' | 'babel', file?: string} | false`
- Default: `{type: 'rollup', file: ${pkg.main}}`

### `umd`

Um package, for publishing to cdn, browser loading, default off

- Type: `{globals: {[prop:string]: string}, name: string, file: string} | false`

### `umd.globals`

Umd dependent external package variable name in the global

- Type: `{[prop:string]: string}`
- Default: `{'react': 'React', 'react-dom': 'ReactDom', 'antd': 'antd'}`

### `umd.name`

The name that the umd package can access via `window.Foo` after being loaded by the browser.

- Type: `string`
- Default: `camelCase(basename(${pkg.name}))`

### `umd.file`

Um package file output path

- Type: `string`
- Default: `${pkg.unpkg} | 'dist/index.umd.js'`

### `external`

Specify external dependencies, cjs and esm packages default to external `dependencies` + `peerDependencies` + external, and umd packages only use external.

- Type: `string[]`
- Default: `['react', 'react-dom', 'antd']`

### `sourcemap`

- Type: `boolean`
- Default: `false`

### `copy`

Copy files when building, such as copying a configuration file that does not need to be packaged to a specified directory

- Type: `{files: string[], dest: []}`
- Default: `undefined`
