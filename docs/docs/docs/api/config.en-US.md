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

depPerChunk is similar to bigVendors, but different in that dependencies are split by package name + version, solving bigVendors’ issues with size and caching efficiency. However, it also brings potential problems, possibly leading to more requests. My understanding is that for non-large projects its actually fine because, 1) a single page's requests will not include a very large number of dependencies, 2) based on HTTP/2, dozens of requests are not a problem. But, for large or huge projects, a more suitable solution is needed.

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

## exportStatic

- Type: `{ extraRoutePaths: IUserExtraRoute[] | (() => IUserExtraRoute[] | Promise<IUserExtraRoute[]>), ignorePreRenderError: boolean }`
- Default: `undefined`

When enabled, HTML files will be generated separately for each route, typically used for static site hosting. For example, if a project has the following routes:

```bash
/
/docs
/docs/a
```

Without `exportStatic` enabled, it will output:

```bash
dist/index.html
```

With `exportStatic` enabled, it will output:

```bash
dist/index.html
dist/docs/index.html
dist/docs/a/index.html
```

Additional pages can be generated through the `extraRoutePaths` sub-configuration, typically used for static generation of dynamic routes. For example, with the following route:

```bash
/news/:id
```

By default, it will only output `dist/news/:id/index.html`, but you can staticize it through `extraRoutePaths` configuration:

```ts
// .umirc.ts
export default {
  exportStatic: {
    // Configure fixed values
    extraRoutePaths: ['/news/1', '/news/2'],
    // Can also configure a function for dynamic retrieval
    extraRoutePaths: async () => {
      const res = await fetch('https://api.example.com/news');
      const data = await res.json();
      return data.map((item) => `/news/${item.id}`);
    },
  },
}
```

The output files will then become:

```bash
dist/news/:id/index.html
dist/news/1/index.html
dist/news/2/index.html
```

In addition to supporting string data configuration, `extraRoutePaths` can also be configured as an object array, used when SSR is enabled but you want to disable pre-rendering for certain routes, for example:

```ts
// .umirc.ts
export default {
  exportStatic: {
    // Output additional page files but skip pre-rendering
    extraRoutePaths: [{ path: '/news/1', prerender: false }],
  },
}
```

When `exportStatic` is used with `ssr`, pre-rendering will be performed. If pre-rendering fails, an exception will be thrown and the build will be terminated. You can configure `ignorePreRenderError` to ignore pre-rendering failure errors, for example:

```ts
// .umirc.ts
export default {
  exportStatic: {
    // Ignore pre-rendering failure errors
    ignorePreRenderError: true,
  },
}
```

## favicons

- Type: `string[]`
- Default: `null`

By default, the site will use the conventional [`favicon`](../guides/directory-structure#favicon) to create icon meta head tags.

You can customize it like this:

```js
favicons: [
  // Complete URL
  'https://domain.com/favicon.ico',
  // This will point to `/favicon.png`, make sure your project has `public/favicon.png`
  '/favicon.png'
]
```

## forget

- Type: `{ ReactCompilerConfig: object }`
- Default: `null`

Whether to enable React Compiler (React Forget) functionality. Reference https://react.dev/learn/react-compiler.

```ts
forget: {
  ReactCompilerConfig: {},
},
```

Note:

1. forget is currently incompatible with mfsu and mako. If forget is enabled while mfsu or mako is on, an error will be thrown.
2. forget requires react 19. When using it, please manually install react@rc and react-dom@rc as project dependencies.

## forkTSChecker

- Type: `object`
- Default: `null`

Enable TypeScript type checking. Based on fork-ts-checker-webpack-plugin, configuration options can be found in [fork-ts-checker-webpack-plugin's Options](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options).

## hash

- Type: `boolean`
- Default: `false`

Enable hash mode to include hash suffixes in build artifacts. Typically used for incremental releases and avoiding browser cache loading.

When enabled, the output typically looks like this:

```
+ dist
    - logo.sw892d.png
    - umi.df723s.js
    - umi.8sd8fw.css
    - index.html
```

Note: HTML files never have hash suffixes.

## headScripts

- Type: `string[] | Script[]`
- Default: `[]`

Configure additional scripts in the `<head>`.

For example:

```js
headScripts: [`alert(1);`, `https://a.com/b.js`],
```

Will generate HTML:

```html
<script>
  alert(1);
</script>
<script src="https://a.com/b.js"></script>
```

If additional attributes are needed, switch to object format, for example:

```js
headScripts: [
  { src: '/foo.js', defer: true },
  { content: `alert('hello');`, charset: 'utf-8' },
],
```

## helmet

- Type: `boolean`
- Default: `true`

Configure the integration of `react-helmet-async`. When set to `false`, `react-helmet-async` will not be integrated, and you won't be able to `import { Helmet }` from the framework. The build artifacts will also be reduced by [the corresponding size](https://bundlephobia.com/package/react-helmet-async).

## history

- Type: `{ type: 'browser' | 'hash' | 'memory' }`
- Default: `{ type: 'browser' }`

Set the routing history type.

## historyWithQuery

- Type: `‌{}`
- Default: `false`

Let history carry query parameters. For navigation scenarios using `useNavigate`, you'll need to handle the query manually.

## https

- Type: `{ cert: string; key: string; hosts: string[]; http2?: boolean }`
- Default: `{ hosts: ['127.0.0.1', 'localhost'] }`

Enable HTTPS mode for development. Umi 4 uses [`mkcert`](https://github.com/FiloSottile/mkcert) by default to quickly create certificates. Please ensure it's installed.

About the parameters:

- `cert` and `key` are used to specify the cert and key files respectively.
- `hosts` specifies which hosts should support HTTPS access, default is `['127.0.0.1', 'localhost']`.
- `http2` specifies whether to use HTTP 2.0 protocol, default is true (using HTTP 2.0 in Chrome or Edge browsers occasionally results in `ERR_HTTP2_PROTOCOL_ERROR`, if encountered, it's recommended to set this to false).

Example:

```js
https: {
}
```

## icons

- Type: `{ autoInstall: {}; alias: Record<string,string>; include: Array<string>; }`
- Default: `false`

You can quickly reference icon sets or local icons through the Icon component exported by umi.

### Using Icon Sets

In the umi configuration file, enable the icons feature and allow automatic installation of icon libraries.

```ts
icons: { autoInstall: {} },
```

Usage in pages:

```ts
import { Icon } from 'umi';
<Icon icon="fa:home" />
```

The string in icon is a combination of `collection:icon`, separated by `:`. Icon sets are recommended to be searched on the [Icônes website](https://icones.js.org/).

### Using Local Icons

In the umi configuration file, enable the icons feature.

```ts
icons: {},
```

To use local svg icons, you need to save the svg files in the `src/icons` directory, then reference them using the `local` prefix. For example, if you have a `umi.svg` in the `src/icons` directory, you can reference it like this:

```tsx
import { Icon } from 'umi';
<Icon icon="local:umi" />
```

### Configuration Options

- `autoInstall` indicates whether to automatically install icon sets; tnpm/cnpm clients are not currently supported, but you can manually install corresponding icon set packages `@iconify-json/collection-name`. Reference: [Icon Collection List](https://github.com/iconify/icon-sets/blob/master/collections.md), collection-name is the ***Icon set prefix*** item in the list.
- `alias` is used to configure icon aliases. For example, after configuring `alias:{home:'fa:home'}`, you can use the `fa:home` icon through `icon="home"`.
- `include` configures icons that need to be forcibly used, for example `include: ['fa:home', 'local:icon']`. Common use cases: when icon strings are defined in a map, making them undetectable; when using the `Icon` component in `mdx`.

### Icon Component Properties

- icon: specify the icon
- width: svg width
- height: svg height
- viewBox: svg viewBox
- style: external container style
- className: external container class name
- spin: whether to auto-rotate
- rotate: configure rotation angle, supports multiple formats like `1`, `"30deg"`, `"25%"`
- flip: supports `vertical`, `horizontal`, or their combination `vertical,horizontal`

## ignoreMomentLocale

- Type: `boolean`
- Default: `true`

Ignore moment's locale files to reduce build size.

Note: This feature is enabled by default. Configure `ignoreMomentLocale: false` to disable it.

## inlineLimit

- Type: `number`
- Default: `10000` (10k)

Configure the threshold for whether image files should be base64 encoded. By default, files less than 10000 bytes will be compiled to base64 encoding, otherwise, they will be generated as separate files.

## jsMinifier (webpack)

- Type: `string`, optional values: `esbuild`, `terser`, `swc`, `uglifyJs`, `none`
- Default: `esbuild`

Configure the tool for minifying JavaScript during build; `none` means no minification.

Example:

```ts
{
  jsMinifier: 'esbuild'
}
```

## jsMinifierOptions

- Type: `object`
- Default: `{}`

Options for `jsMinifier`; by default, code minification will remove comments in the code, you can preserve comments through the corresponding `jsMinifier` options.

Example:
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

Configuration options need to correspond with the tool being used, refer to the respective documentation:

- [esbuild reference](https://esbuild.github.io/api/#minify)
- [terser reference](https://terser.org/docs/api-reference#minify-options)
- [swc reference](https://swc.rs/docs/configuration/minification#configuration)
- [uglifyJs reference](https://lisperator.net/uglifyjs/compress)

## lessLoader

- Type: `object`
- Default: `{ modifyVars: userConfig.theme, javascriptEnabled: true }`

Configure less-loader's Options. See [less-loader's Options](https://github.com/webpack-contrib/less-loader#lessoptions) for specific details.

> The default version is less@4. If you need compatibility with less@3, please configure using [less-options-math](https://lesscss.org/usage/#less-options-math).

## legacy

- Type: `{ buildOnly?: boolean; nodeModulesTransform?: boolean; checkOutput?: boolean; }`
- Default: `false`

When you need to support older browsers, you might need this option. When enabled, it will use **non-modern** build tools by default, which will significantly increase your build time.

```ts
legacy: {}
```

By default, it only takes effect during build. You can disable this restriction by setting `buildOnly: false`.

You can enable the `checkOutput: true` option to automatically run [`es-check`](https://github.com/yowainwright/es-check) after each build to check if the `.js` files in the output are in es5 format.

When this option is enabled:

 - Custom `srcTranspiler`, `jsMinifier`, `cssMinifier` options are not supported.
 - All source code in `node_modules` will be transpiled, with `targets` compatible down to ie 11. You can disable the transformation of `node_modules` by specifying `nodeModulesTransform: false`. In this case, you can use `extraBabelIncludes` to more precisely transform packages with compatibility issues.
 - Since older browsers don't support Top level await, when using `externals`, make sure you're not using asynchronous [`externalsType`](https://webpack.js.org/configuration/externals/#externalstype) while using synchronous dependency imports.

## links

- Type: `Link[]`
- Default: `[]`

Configure additional link tags.

Example:

```js
links: [{ href: '/foo.css', rel: 'preload' }],
```

## mako <Badge>4.3.2+</Badge>

- Type: `{ plugins?: Array<{ load?: ((...args: any[]) => unknown) | undefined; generateEnd?: ((...args: any[]) => unknown) | undefined; }> | undefined; px2rem?: { root?: number | undefined; propBlackList?: Array<string> | undefined; propWhiteList?: Array<string> | undefined; selectorBlackList?: Array<string> | undefined; selectorWhiteList?: Array<string> | undefined; selectorDoubleList?: Array<string> | undefined; } | undefined; experimental?: { webpackSyntaxValidate?: Array<string> | undefined; } | undefined; flexBugs?: boolean | undefined; moduleIdStrategy?: string | undefined; optimization?: { skipModules?: boolean | undefined; } | undefined; }`
- Default: `{}`

Use [mako](https://makojs.dev/) for compilation to significantly improve build speed.
Enable this capability through configuration, which will be passed to mako. Only some common configurations are provided here; more configurations can be set in the `mako.config.json` file. For more information, see the [mako-config documentation](https://makojs.dev/docs/config).

## manifest

- Type: `{ fileName: string; basePath: string }`
- Default: `null`

Enable generating an additional manifest file during build to describe the artifacts.

About the parameters: `fileName` is the name of the generated file, default is `asset-manifest.json`; `basePath` adds a prefix to all file paths.

Note: Only generated during build.

## mdx

- Type: `{ loader: string; loaderOptions: Object }`
- Default: `{}`

Configure mdx loader path and [loaderOptions](https://github.com/mdx-js/mdx/blob/v1/packages/mdx/index.js#L12) parameters.

## metas

- Type: `Meta[]`
- Default: `[]`

Configure additional meta tags.

For example:

```js
metas: [
  { name: 'keywords', content: 'umi, umijs' },
  { name: 'description', content: 'React framework.' },
],
```

Will generate the following HTML:

```html
<meta name="keywords" content="umi, umijs" />
<meta name="description" content="React framework." />
```

## mfsu

- Type: `{ esbuild: boolean; mfName: string; cacheDirectory: string; strategy: 'normal' | 'eager'; include?: string[]; chainWebpack: (memo, args) => void; exclude?: Array<string | RegExp> }`
- Default: `{ mfName: 'mf', strategy: 'normal' }`

Configure speed-up functionality based on [Module Federation](https://module-federation.github.io/).

About the parameters:

- `esbuild`: When set to `true`, dependency pre-compilation will use esbuild, making first startup faster. The downside is that secondary compilation won't have physical cache and will be slightly slower; recommended for projects with stable dependencies.
- `mfName`: This is the global variable for this solution's remote library, default is mf. Usually configured in micro-frontends to avoid conflicts between main and sub applications.
- `cacheDirectory`: Can customize the cache directory, default is `node_modules/.cache/mfsu`
- `chainWebpack`: Modify dependency webpack configuration using chain programming, based on webpack-chain. See [webpack-api documentation](https://github.com/sorrycc/webpack-chain) for specific APIs.
- `runtimePublicPath`: Will modify the publicPath of mf loading files to `window.publicPath`
- `strategy`: Specifies when mfsu compiles dependencies; in `normal` mode, Module Federation remote package is built after babel compilation analysis; in `eager` mode, building starts simultaneously with project code using static analysis.
- `include`: Only effective in `strategy: 'eager'` mode, used to compensate for dependencies that static analysis cannot detect in eager mode. For example, if `react` hasn't entered Module Federation remote modules, you can configure `{ include: [ 'react' ] }`
- `exclude`: Manually exclude certain dependencies that don't need MFSU processing. Can be strings or regular expressions. For example, if you don't want `vant` to go through MFSU processing, you can configure `{ exclude: [ 'vant' ] }` for exact word matching, or `{ exclude: [ /vant/ ] }` to exclude any dependencies whose `import` path matches the regex.

Example:

```js
// Use esbuild for dependency pre-compilation
mfsu: {
  esbuild: true,
}

// Disable mfsu functionality
mfsu: false;
```

```js
// webpack configuration modification
mfsu: {
```

## mock

- Type: `{ exclude: string[], include: string[] }`
- Default: `{}`

Configure mock functionality.

About the parameters. `exclude` is used to exclude unwanted mock files; `include` is used to add additional mock files outside the mock directory.

Example:

```js
// Make all _mock.ts files under pages become mock files
mock: {
  include: ['src/pages/**/_mock.ts'],
}
```

Note: This feature is enabled by default. Configure `mock: false` to disable it.

## mountElementId

- Type: `string`
- Default: `'root'`

Configure the element id where the React component tree is rendered in HTML.

Example:

```js
mountElementId: 'container'
```

## monorepoRedirect

- Type: `{ srcDir?: string[], exclude?: RegExp[], peerDeps?: boolean, useRootProject?: boolean }`
- Default: `false`

When using Umi in a monorepo, you might need to import components, utility functions, etc. from other sub-packages. By enabling this option, you can redirect these sub-package imports to their source code location (default is the `src` folder). This can also solve the issue of sub-package changes not hot-reloading in `MFSU` scenarios.

The benefits of this redirection are: supports hot updates, no need to pre-build other sub-packages for development.

Use `srcDir` to adjust the priority location for identifying source code folders, and use `exclude` to set dependencies that don't need redirection.

Example:

```js
// Default redirect to sub-package's src folder
monorepoRedirect: {}
// In sub-packages, prioritize redirecting to libs folder
monorepoRedirect: {
  srcDir: ['libs', 'src'],
}
// Don't redirect @scope/* sub-packages
monorepoRedirect: {
  exclude: [/^@scope\/.+/],
}
```

In actual large business monorepos, each sub-package's dependencies are loaded by looking up `node_modules` from their directory upward. However, during local development, dependencies are installed in `devDependencies`, which behaves differently from npm installation, inevitably leading to multiple instance issues.

:::info
For example, each sub-package needs `antd` during local development, installed in `devDependencies` and specified in `peerDependencies`. We expect that when the package is published to npm and installed by a project, `antd` uses the project's own dependency, globally unique. However, in the monorepo, dependencies specified in `devDependencies` must exist, and when sub-package code looks for dependencies, it starts from that sub-package, causing each sub-package to use its own `antd`, resulting in multiple copies of `antd` in the output, increased bundle size, broken message queues, etc.
:::

To solve this issue, we stipulate:

When the `peerDeps` option is enabled, all `peerDependencies` specified by sub-packages will automatically be added `alias` redirection for uniqueness, avoiding multiple instances:

```ts
monorepoRedirect: { peerDeps: true }
```

After redirection, dependencies become globally unique, maintaining consistency with the experience after installing packages from npm.

useRootProject: When your project is not in a monorepo subfolder but at the monorepo root, you can enable this option to make monorepoRedirect effective.

## mpa

- Type: `object`
- Default: `false`

Enable [mpa mode](../guides/mpa).

## outputPath

- Type: `string`
- Default: `dist`

Configure the output path.

Note: Not allowed to be set to directories related to conventional functionality such as src, public, pages, mock, config, locales, models, etc.

## phantomDependency

- Type: `{ exclude: string[] }`
- Default: `false`

Execute phantom dependency detection.

When using dependencies not declared in package.json, and not configured through alias or externals, it will throw an error and remind you.

![](https://mdn.alipayobjects.com/huamei_ddtbzw/afts/img/A*k5uoQ5TOPooAAAAAAAAAAAAADkCKAQ/original)

If you need to whitelist certain dependencies, you can do so through the exclude configuration option. The exclude items are npm dependency package names.

```ts
export default {
  phantomDependency: {
    exclude: ['lodash']
  }
}
```

## plugins

- Type: `string[]`
- Default: `[]`

Configure additional Umi plugins.

Array items are paths pointing to plugins, which can be npm dependencies, relative paths, or absolute paths. If it's a relative path, it will start looking from the project root directory.

Example:

```js
plugins: [
  // npm dependency
  'umi-plugin-hello',
  // relative path
  './plugin',
  // absolute path
  `${__dirname}/plugin.js`,
],
```

## polyfill

- Type: `{ imports: string[] }`
- Default: `{}`

Configure polyfills to be imported on demand. By default, all polyfills are imported.

For example, to only import the stable part of core-js:

```js
polyfill: {
  imports: ['core-js/stable'],
}
```

If you have more extreme performance requirements, you can consider importing on demand:

```js
polyfill: {
  imports: ['core-js/features/promise/try', 'core-js/proposals/math-extensions'],
}
```

Note: This feature is enabled by default. Configure `polyfill: false` or set environment variable `BABEL_POLYFILL=none` to disable it.

## postcssLoader

- Type: `object`
- Default: `{}`

Configure [postcss-loader options](https://github.com/webpack-contrib/postcss-loader#options).

## presets

- Type: `string[]`
- Default: `[]`

Configure additional Umi preset collections.

Array items are paths pointing to preset collections, which can be npm dependencies, relative paths, or absolute paths. If it's a relative path, it will start looking from the project root directory.

Example:

```js
presets: [
  // npm dependency
  'umi-preset-hello',
  // relative path
  './preset',
  // absolute path
  `${__dirname}/preset.js`,
],
```

## proxy

- Type: `object`
- Default: `{}`

Configure proxy functionality.

For example:

```js
proxy: {
  '/api': {
    'target': 'http://jsonplaceholder.typicode.com/',
    'changeOrigin': true,
    'pathRewrite': { '^/api' : '' },
  }
}
```

Then accessing `/api/users` will access the data from http://jsonplaceholder.typicode.com/users.

Note: The proxy functionality is only effective during development.

## publicPath

- Type: `string`
- Default: `/`

Configure webpack's publicPath.

## reactRouter5Compat

- Type: `object`
- Default: `false`

Enable react-router 5 compatibility mode. In this mode, route component props will include location, match, history, and params properties, maintaining consistency with react-router 5.

However, note that:

1. This mode will have additional re-renders
2. Due to the history library update, the location still doesn't have a query property

## routes

- Type: `Route[]`
- Default: `[]`

Configure routes. For more information, please see [Configuring Routes](../guides/routes#configuring-routes)

## routeLoader

- Type: `{ moduleType: 'esm' | 'cjs' }`
- Default: `{ moduleType: 'esm' }`

Configure how routes are loaded. Setting moduleType to 'cjs' will load route components using `require`.

```ts
// moduleType: esm
'index': React.lazy(() => import(/* webpackChunkName: "p__index" */'../../pages/index.tsx')),

// moduleType: cjs
'index': React.lazy(() => Promise.resolve(require('../../pages/index.tsx'))),
```

## routePrefetch

- Type: `{ defaultPrefetch: 'none' | 'intent' | 'render' | 'viewport', defaultPrefetchTimeout: number } | false`
- Default: `false`

Enable route preloading functionality.

## run

- Type: `{ globals: string[] }`
- Default: `null`

Global injection configuration for the run command. Adding `['zx/globals']` means when using `umi run ./script.ts`, umi will automatically inject `import 'zx/globals';`, eliminating the need to write `import 'zx/globals';` in every script.

## runtimePublicPath

- Type: `object`
- Default: `null`

Enable runtime publicPath, which will use `window.publicPath` as the starting path for dynamic resource loading when enabled.

For example:

```js
runtimePublicPath: {},
```

## sassLoader

- Type: `object`
- Default: `{}`

Configure sass-loader, see [sass-loader > options](https://github.com/webpack-contrib/sass-loader#options)

## styleLoader

- Type: `object`
- Default: `false`

Enable style loader functionality, allowing CSS to be inlined in JS without outputting additional CSS files.

## stylusLoader

- Type: `object`
- Default: `{}`

Configure stylus-loader, see [stylus-loader > options](https://github.com/webpack-contrib/stylus-loader#options)

## styles

- Type: `string[]`
- Default: `[]`

Configure additional CSS.

Configuration items support inline styles and external style paths, the latter determined by whether it starts with https?://.

Inserted styles are prepended, with lower priority than user-written styles in the project.

For example:

```js
styles: [`body { color: red; }`, `https://a.com/b.css`],
```

Will generate the following HTML:

```html
<style>
  body {
    color: red;
  }
</style>
<link rel="stylesheet" href="https://a.com/b.css" />
```

## srcTranspiler

- Type: `string` optional values: `babel`, `swc`, `esbuild`
- Default: `babel`

Configure the tool for transpiling js/ts during build.

## srcTranspilerOptions

- Type: `{ swc?: SwcConfig, esbuild?: EsbuildConfig }`
- Default: `undefined`

If you use `swc` / `esbuild` as the `srcTranspiler` transpiler, you can further configure the transpiler through this option. See [SwcConfig](https://swc.rs/docs/configuration/swcrc) and [EsbuildConfig](https://esbuild.github.io/api/#transform-api) documentation for details.

For example, adding other plugins to swc:

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

- Type: `object`
- Default: `{}`

svgr is enabled by default, supporting the following way to use React svg components:

```ts
import SmileUrl, { ReactComponent as SvgSmile } from './smile.svg';
```

You can configure svgr's behavior, see [@svgr/core > Config](https://github.com/gregberge/svgr/blob/main/packages/core/src/config.ts#L9) for configuration options.

## svgo

- Type: `object`
- Default: `{}`

Uses svgo by default to optimize svg resources, see [svgo](https://github.com/svg/svgo#configuration) for configuration options.

## targets

- Type: `object`
- Default: `{ chrome: 80 }`

Configure the minimum browser versions to support. Umi will automatically introduce polyfills, configure autoprefixer, and perform syntax transformations based on this.

Example:

```js
// Support ie11
targets: {
  ie: 11,
}
```

## theme

- Type: `object`
- Default: `{}`

Configure less variable theme.

Example:

```js
theme: { '@primary-color': '#1DA57A' }
```

## title

- Type: `string`
- Default: `null`

Configure global page title, currently only supports static Title.

## verifyCommit

- Type: `{ scope: string[]; allowEmoji: boolean }`
- Default: `{ scope: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'workflow', 'build', 'ci', 'chore', 'types', 'wip', 'release', 'dep', 'deps', 'example', 'examples', 'merge', 'revert'] }`

Configuration options for the verify-commit command.

About parameters. `scope` is used to configure allowed scopes, case-insensitive, configuration will override the defaults; `allowEmoji` when enabled will allow EMOJI prefixes, like `💥 feat(module): added a great feature`.

```
verifyCommit: {
  scope: ['feat', 'fix'],
  allowEmoji: true,
}
```

Note: Commit messages generated by `git revert` or `git merge` commands and changesets' release merge format will pass verification by default.

## vite

- Type: `object`
- Default: `{}`

Developer's configuration will be merged into vite's [default configuration](https://vitejs.dev/config/).

Example:

```js
// Change temporary file path to node_modules/.bin/.vite folder
vite: {
  cacheDir: 'node_modules/.bin/.vite',
}
```

## writeToDisk

- Type: `boolean`
- Default: `false`

When enabled, it will output an additional copy of files to the dist directory in dev mode, typically used for chrome extension, electron application, sketch plugin, and other development scenarios.
