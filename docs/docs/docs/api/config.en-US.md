---
order: 2
toc: content
translated_at: '2024-03-17T10:42:29.295Z'
---

# Configuration

For the custom configurations available in umi, you can use the `.umirc.ts` file or `config/config.ts` in the project root directory. It's noteworthy that both files have the same functionality, just residing in different directories. You have to choose one of them, with `.umirc.ts` having a higher priority.

> For more information about the directory structure, you can learn more [here](../guides/directory-structure).

umi's configuration file is a regular node module, which is used when the umi [command line](./commands) is executed and is not included in the browser-side build.

> For some configurations that are required for the browser-side build, and some configurations that affect the style presentation, in umi they are collectively referred to as "runtime configuration", you can see more about it in [runtime configuration](./runtime-config).

Here is the simplest example of an umi configuration file:

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  outputPath: 'dist',
});
```

Wrapping configurations with `defineConfig` is to get better spell check support when writing the configuration file. If you don't need it, `export default {}` works too.

It's important to note that when using umi, you don't need to understand the purpose of each configuration. You can briefly browse through all the configurations that umi supports below, and then, when needed, come back to see how to enable and modify the configurations you need.

> For convenience, the following configurations are sorted alphabetically.

## alias

- Type: `Record<string, string>`
- Default value: `{}`

Configure aliases, to map the source in import statements.

For example:

```js
{
  alias: {
    foo: '/tmp/to/foo',
  }
}
```

Then in the code, `import 'foo'` will actually become `import '/tmp/to/foo'`.

Some tips:

1. It's better to use absolute paths as the value of alias, especially when pointing to a dependency, remember to add `require.resolve`, for instance,

```js
// ❌
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

2. If you don't want subpaths to be mapped as well, remember to add a `$` suffix, for example

```js
// import 'foo/bar' will be mapped to import '/tmp/to/foo/bar'
{
  alias: {
    foo: '/tmp/to/foo',
  }
}

// import 'foo/bar' will still be import 'foo/bar', and won't be modified
{
  alias: {
    foo$: '/tmp/to/foo',
  }
}
```

## autoprefixer

- Type: `object`
- Default value: `{ flexbox: 'no-2009' }`

Used for parsing CSS and adds vendor prefixes to CSS rules using values from Can I Use. It enables autoprefixing, such as automatically adding `-webkit-` prefix.

For more configurations, please consult [autoprefixer's options](https://github.com/postcss/autoprefixer#options).

## analyze

- Type: `object`
- Default value: `{}`

Specific configuration options for the analyzer plugin when analyzing product composition through the [`ANALYZE`](../guides/env-variables#analyze) environment variable. See [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin)

When using Vite mode, in addition to customizing the configuration of [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), `excludeAssets`, `generateStatsFile`, `openAnalyzer`, `reportFilename`, `reportTitle` options will automatically adapt.

## base

- Type: `string`
- Default value: `/`

To deploy the umi project in a non-root directory, you can use the base configuration.

The base configuration allows you to set a routing prefix for your application. For example, with routes `/` and `/users`, after setting base to `/foo/`, you can access the previous routes through `/foo/` and `/foo/users`.

> Note: The base configuration must be set at build time and can't be changed without rebuilding, because this value is inlined in the client-side package.

## cacheDirectoryPath

- Type: `string`
- Default value: `node_modules/.cache`

By default, Umi stores some cache files generated during the build process in the `node_modules/.cache` directory, such as logger logs, webpack cache, mfsu cache, etc. You can modify Umi's cache file directory using the `cacheDirectoryPath` configuration.

Example,

```js
// Change the cache file path to the node_modules/.cache1 folder
cacheDirectoryPath: 'node_modules/.cache1',
```

## chainWebpack

- Type: `(memo, args) => void`
- Default value: `null`

To extend Umi's built-in webpack configuration, we provide a way to modify the webpack configuration in a chained programming style, based on webpack-chain. See the documentation of webpack-api for specific APIs.

As shown below:

```js
export default {
  chainWebpack(memo, args) {
    return memo;
  },
};
```

This function has two parameters:

- `memo` is the existing webpack configuration
- `args` contains some additional information and auxiliary objects, currently including `env` and `webpack`. `env` is the current environment, with values of `development` or `production`; `webpack` is the webpack object, from which webpack's built-in plugins can be obtained.

Usage example:

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // Set alias
    memo.resolve.alias.set('foo', '/tmp/to/foo');

    // Add extra plugins
    memo.plugin('hello').use(Plugin, [...args]);

    // Delete Umi's built-in plugin
    memo.plugins.delete('hmr');
  },
};
```

## clickToComponent

- Type: `{ editor?: string }`
- Default value: `false`

> Currently, only React projects are supported.

When this feature is enabled, you can jump to the source code location in the editor by `Option+Click/Alt+Click` on the component. `Option+Right-click/Alt+Right-click` opens the context to view the parent component.

About parameters. The `editor` parameter defaults to 'vscode', supporting `vscode` & `vscode-insiders`.

Configure the behavior of clickToComponent, for more details see [click-to-component](https://github.com/ericclemmons/click-to-component).

Example:

```ts
// .umirc.ts
export default {
  clickToComponent: {},
};
```

## clientLoader

- Type: `{}`
- Default value: `false`

When enabled, you can declare a data loading function `clientLoader` for each route. Extracting the data loading process required by the page into `clientLoader` allows Umi to preload the data before the page components are fully loaded, avoiding the issue of waterfall requests. For details, see [Route Data Preloading](../guides/client-loader).

Example:

```ts
// .umirc.ts
export default {
  clientLoader: {},
};
```

Configuration enabled, use in the route component:

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

- Type: `{ jsStrategy: 'bigVendors' | 'depPerChunk' | 'granularChunks'; jsStrategyOptions: {} }`
- Default value: `null`

Provide code splitting strategy solutions.

bigVendors is the big vendors scheme, which packs the files under node_modules in the async chunk together, which can avoid repetition. At the same time, the disadvantages are, 1) the size of a single file is too large, 2) there is no caching efficiency to speak of.

depPerChunk is similar to bigVendors, but different in that dependencies are split by package name + version, solving bigVendors’ issues with size and caching efficiency. However, it also brings potential problems, possibly leading to more requests. My understanding is that for non-large projects it’s actually fine because, 1) a single page's requests will not include a very large number of dependencies, 2) based on HTTP/2, dozens of requests are not a problem. But, for large or huge projects, a more suitable solution is needed.

granularChunks take a middle value between bigVendors and depPerChunk, while also having better utilization of caching efficiency. Unless there are special circumstances, the granularChunks strategy is recommended.

## conventionLayout

- Type: `boolean`
- Default value: `undefined`

`src/layouts/index.[tsx|vue|jsx|js]` is conventionally set as layout, enabled by default. It can be disabled by setting `conventionLayout: false`.

## conventionRoutes

- Type: `{ base: string; exclude: RegExp[] }`
- Default value: `null`

Modify the default convention-based route rules, only valid when using umi's convention-based routing. Convention-based routing, also known as file-based routing, means that you don’t need to write configurations manually, as the file system is the routes, and the routing configuration is analyzed through directories and files and their naming.

When using convention-based routing, it's conventioned that all `(j|t)sx?` files under `src/pages` are routes.

> You can see more details in [Convention-based Routing](../guides/routes#conventional-routing).

### base

`base` is used to set the base path for the routes by convention, by default reading from `src/pages`. If it is a site for documentation, you might need to change it to `./docs`;

### exclude

You can use `exclude` to filter some files that are not needed, such as you can use it to exclude files under components, models, etc.

Example,

```js
// Do not recognize files under components and models directories as routes
conventionRoutes: {
  exclude: [/\/components\//, /\/models\//],
}
```

## copy

- Type: `Array<string | { from: string; to: string; }>`
- Default value: `[]`

Configure the files or folders to be copied to the output directory.

When configuring as a string, it is copied to the product directory by default, such as:

```ts
copy: ['foo.json', 'src/bar.json']
```

Will produce the following product structure:

```
+ dist
  - bar.json
  - foo.json
+ src
  - bar.json
- foo.json
```

You can also configure the specific copy location through objects, where the relative path starts from the project root directory:

```ts
copy: [
  { from: 'from', to: 'dist/output' },
  { from: 'file.json', to: 'dist' }
]
```

This time will produce the following product structure:

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

- Type: `{ includes?: string[] }`
- Default value: `false`

Configure the script tag's crossorigin. If declared, the local script will have a crossorigin="anonymous" attribute.

Regarding the parameters. The parameter `includes` can allow extra non-local script tags to have this attribute.

For example:

```
crossorigin: {}
```

Then the output HTML will have these changes,

```diff
-
<script src="/umi.js"></script>
+
<script src="/umi.js" crossorigin="anonymous"></script>
```

## cssMinifier

- Type: `string`, optional values: `esbuild`, `cssnano`, `parcelCSS`, `none`
- Default value: `esbuild`

Configure the tool for minifying CSS during build time; `none` means not to minify.

Example:

```js
{
  cssMinifier: 'esbuild'
}
```

## cssMinifierOptions

- Type: `object`
- Default value: `{}`

Options for the CSS minification tool, `cssMinifier`.

Example:

```js
{
  cssMinifier: 'esbuild',
  cssMinifierOptions: {
    minifyWhitespace: true,
    minifySyntax: true,
  },
}
```

Consult the corresponding documentation for CSS minification configuration.

- [esbuild reference](https://esbuild.github.io/api/#minify)
- [cssnano reference](https://cssnano.co/docs/config-file/)
- [parcelCSS reference](https://github.com/parcel-bundler/parcel-css/blob/master/node/index.d.ts)

## cssPublicPath
- Type: `string`
- Default value: `./`

Customize the public path for external resources like images and files in CSS. Acts similar to `publicPath`. The default value is `./`.

## cssLoader

- Type: `object`
- Default value: `{}`

Configure css-loader , see [css-loader > options](https://github.com/webpack-contrib/css-loader#options)

## cssLoaderModules

- Type: `object`
- Default value: `{}`

Configure the behavior of CSS modules, see [css-loader > modules](https://github.com/webpack-contrib/css-loader#modules).

For example:

```ts
cssLoaderModules: {
  // Configure to use camelCase
  exportLocalsConvention: 'camelCase'
}
```

## deadCode

- Type: `{ patterns?: string[]; exclude?: string[]; failOnHint?: boolean; detectUnusedFiles?: boolean; detectUnusedExport?: boolean; context?: string }`
- Default value: `false`

Check for unused files and exports, only enabled at build phase.

For example:

```
deadCode: {}
```

Then execute build, if any issues are found, a warning will be printed:

```
Warning: There are 1 unused files:
 1. /pages/index.module.less
 Please be careful if you want to remove them (¬º-°)¬.
```

Configuration items:

 - `patterns` : Scope of code identification, such as `['src/pages/**']`
 - `exclude` : Scope to exclude from detection, such as `['src/pages/utils/**']`
 - `failOnHint` : Whether to stop the process if detection fails, default `false` not to stop
 - `detectUnusedFiles` : Whether to detect unused files, default `true` for detection
 - `detectUnusedExport` : Whether to detect unused exports, default `true` for detection
 - `context` : The directory to start matching, default as the current project root directory

## define

- Type: `Record<string, string>`
- Default value: As shown below

```
  { 
    'process.env.NODE_ENV' : process.env.NODE_ENV,
    'process.env.HMR' : process.env.HMR, 
    'process.env.SOCKET_SERVER': process.env.ERROR_OVERLAY' 
  }
```

Set available variables in the code based on [define-plugin plugin](https://webpack.js.org/plugins/define-plugin/).

:::warning{title=🚨}
1. Property values will be converted with `JSON.stringify`.
2. The replacement of key values is matched by their syntactic form, for instance, configuring `{'a.b.c': 'abcValue'}` can't replace the code in `a.b?.c`.
:::

For example,

```
define: { FOO: 'bar' }
```

Then the code like `console.log(hello, FOO)` will be compiled to `console.log(hello, 'bar')`.

When you use these variables in a TypeScript project, you need to declare the variable type in the typings file to support ts type hints, for example:

If your typings file is global:

```ts
// typings.d.ts
declare const FOO: string;
```

If your typings file is non-global (contains import/export):

```ts
// typings.d.ts
import './other.d.ts';

declare global {
 const FOO: string;
}
```
## devtool

- Type: `string`
- Default value: Dev defaults to `cheap-module-source-map`, no sourcemap by default for build

Sets the sourcemap generation method.

Common optional values include:

- `eval`, the fastest type, but does not support old browsers
- `source-map`, the slowest but most comprehensive type

Example,

```js
// Disable sourcemap generation in dev stage
devtool: false;

// Only set sourcemap for dev stage
devtool: process.env.NODE_ENV === 'development' ? 'eval' : false;
```

## classPropertiesLoose
- Type: `object`
- Default value: `{}`

Set babel class-properties to enable loose mode

## esbuildMinifyIIFE

- Type: `boolean`
- Default value: `false`

Fix the namespace conflict caused by global variables automatically introduced by the esbuild compressor.

Since Umi 4 defaults to using esbuild as the compressor, the compressor will automatically inject global variables as polyfill, which may cause conflicts like async chunks global variables, conflicts between qiankun sub-apps and main apps' global variables, etc. This issue can be resolved by enabling this option or switching the [`jsMinifier`](#jsminifier-webpack) compressor.

For more details, see [vite#7948](https://github.com/vitejs/vite/pull/7948).

Example,
```ts
esbuildMinifyIIFE: true
```

## externals

- Type: `Record<string, string> | Function`
- Default value: `{}`

Set which modules are not to be bundled, instead to be imported through `<script>` or other methods, usually used in conjunction with headScripts configuration.

Example,

```
// external react
externals: { react: 'React' },
headScripts: ['https://unpkg.com/react@17.0.1/umd/react.production.min.js'],
```

Note: Do not easily set antd’s externals, as due to its many dependencies and complicated usage, many problems could occur, and it’s hard to fully explain in one or two sentences.

## extraBabelIncludes

- Type: `Array<string | RegExp>`
- Default value: `[]`

Configures extra NPM packages or directories for Babel compilation. For example:

```js
export default {
  extraBabelIncludes: [
    // Support absolute path
    join(__dirname, '../../common'),
    // Support npm package
    'react-monaco-editor',
    // Transpile all paths containing @scope
    /@scope/
  ],
};
```

## extraBabelPlugins

- Type: `string[] | Function`
- Default value: `[]`

Configures extra babel plugins. Can pass the plugin address or plugin function.

## extraBabelPresets

- Type: `string[] | Function`
- Default value: `[]`

Configures extra babel plugin sets. Can pass the plugin set address or plugin set function.

## extraPostCSSPlugins

- Type: `PostCSSPlugin[]`
- Default value: `[]`

Configures extra postcss
