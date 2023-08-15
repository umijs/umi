import { Message } from 'umi'

# Configuration

For custom configurations that can be used in umi, you can use the `.umirc.ts` file in the project root directory or `config/config.ts`. It's worth noting that these two files have the same functionality and differ only in directory location, so you can choose either one, but `.umirc.ts` has higher priority.

> For more information about directory-related details, you can refer to [Directory Structure](../guides/directory-structure).

The configuration file for umi is a regular Node.js module. It is used when executing umi [commands](./commands) and is not included in the browser-side build.

> Some configurations required for browser-side builds and other configurations affecting styling are collectively referred to as "runtime configurations" in umi. You can find more information about them in [Runtime Configuration](./runtime-config).

Here's a simple example of a umi configuration file:

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  outputPath: 'dist',
});
```

Using `defineConfig` to wrap the configuration provides better auto-completion support while writing configuration files. If you don't need it, you can also use `export default {}` directly.

It's worth noting that when using umi, you don't need to understand the purpose of every configuration. You can roughly browse through all the configurations supported by umi, and then come back to see how to enable and modify the ones you need when necessary.

> For easy reference, the following configuration options are listed in alphabetical order.

## alias

- Type: `Record<string, string>`
- Default: `{}`

Configures aliases for mapping `import` statements to sources.

For example:

```js
{
  alias: {
    foo: '/tmp/to/foo',
  }
}
```

Then the code `import 'foo'` will actually import from `/tmp/to/foo`.

A couple of tips:

1. It's better to use absolute paths for alias values, especially when referring to dependencies. Remember to use `require.resolve`, for example:

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

2. If you don't want sub-paths to be mapped, add a `$` suffix, for example:

```js
// import 'foo/bar' will be mapped to import '/tmp/to/foo/bar'
{
  alias: {
    foo: '/tmp/to/foo',
  }
}

// import 'foo/bar' will still be import 'foo/bar', not modified
{
  alias: {
    foo$: '/tmp/to/foo',
  }
}
```

## autoprefixer

- Type: `object`
- Default: `{ flexbox: 'no-2009' }`

Used to parse CSS and add vendor prefixes to CSS rules based on values from Can I Use. For example, automatically adding `-webkit-` prefixes to CSS.

For more configuration options, please refer to [autoprefixer options](https://github.com/postcss/autoprefixer#options).

## analyze

- Type: `object`
- Default: `{}`

Configures specific options for the analyzer plugin when analyzing the composition of artifacts using the specified [`ANALYZE`](../guides/env-variables#analyze) environment variable. See [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) for detailed configuration options for the analyzer plugin.

When using Vite mode, in addition to customizing the configuration for [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer), the options `excludeAssets`, `generateStatsFile`, `openAnalyzer`, `reportFilename`, and `reportTitle` will be automatically adapted.

## base

- Type: `string`
- Default: `/`

When deploying a umi project under a non-root directory, you can use the base configuration.

The base configuration allows you to set a route prefix for the application. For example, if you have routes `/` and `/users`, setting the base to `/foo/` would allow accessing the previous routes via `/foo/` and `/foo/users`.

> Note: The base configuration must be set during build and cannot be changed without a rebuild, as this value is inlined in the client bundle.

## cacheDirectoryPath

- Type: `string`
- Default: `node_modules/.cache`

By default, Umi stores certain cache files from the build in the `node_modules/.cache` directory, such as logger logs, webpack cache, mfsu cache, etc. You can use the `cacheDirectoryPath` configuration to change the cache directory for Umi.

Example:

```js
// Change the cache file path to the folder node_modules/.cache1
cacheDirectoryPath: 'node_modules/.cache1',
```

## chainWebpack

- Type: `(memo, args) => void`
- Default: `null`

To extend the built-in webpack configuration of Umi, a chainable approach to modifying the webpack configuration is provided, based on webpack-chain. For specific API details, you can refer to the [webpack-chain documentation](https://github.com/mozilla-neutrino/webpack-chain).

For example:

```js
export default {
  chainWebpack(memo, args) {
    return memo;
  },
};
```

This function has two parameters:

- `memo` is the existing webpack configuration.
- `args` contains additional information and helper objects, currently including `env` and `webpack`. `env` is the current environment, with values `development` or `production`; `webpack` is the webpack object from which built-in plugins and more can be obtained.

Usage example:

```js
export default {
  chainWebpack(memo, { env, webpack }) {
    // Set alias
    memo.resolve.alias.set('foo', '/tmp/to/foo');

    // Add additional plugins
    memo.plugin('hello').use(Plugin, [...args]);

    // Remove built-in Umi plugins
    memo.plugins.delete('hmr');
  },
};
```

## clickToComponent

- Type: `{ editor?: string }`
- Default: `false`

> Currently, only React projects are supported.

When enabled, you can use `Option+Click` or `Alt+Click` to navigate to the source code location of a component in the editor when clicking on a component. You can also use `Option+Right-click` or `Alt+Right-click` to open the context and view the parent component.

Regarding parameters, the `editor` parameter is the editor name and is set to 'vscode' by default. Supported options are `vscode` and `vscode-insiders`.

You can configure the behavior of `clickToComponent` using the [click-to-component](https://github.com/ericclemmons/click-to-component) documentation.

Example:

```ts
// .umirc.ts
export default {
  clickToComponent: {},
};
```

## clientLoader

- Type: `{}`
- Default: `false`

When enabled, you can declare a data loading function `clientLoader` for each route. Extracting the data loading program that the page requires to `clientLoader` allows Umi
to preload data before the page component is fully loaded. This avoids the waterfall request problem. For more details, see [Route Data Preloading](../guides/client-loader).

Example:

```ts
// .umirc.ts
export default {
  clientLoader: {},
};
```

With this configuration enabled, you can use it in the route component:

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
- Default: `null`

Provides strategies for code splitting.

bigVendors bundles all node_modules files from async chunks together to avoid redundancy. However, it results in large single files without caching efficiency.

depPerChunk is similar to `bigVendors` but splits dependencies based on package name and version, addressing the issues of size and cache efficiency. It may increase the number of requests.

granularChunks strikes a balance between `bigVendors` and `depPerChunk`, offering better cache efficiency. For typical scenarios, using `granularChunks` is recommended.

## conventionLayout

- Type: `boolean`
- Default: `undefined`

`src/layouts/index.[tsx|vue|jsx|js]` is the convention for layout. It's enabled by default. You can disable this default behavior by setting `conventionLayout: false`.

## conventionRoutes

- Type: `{ base: string; exclude: RegExp[] }`
- Default: `null`

Modifies the default convention for routing. Only applicable when using umi's convention-based routing, also known as file-based routing, where the file system defines the routing configuration.

With convention-based routing, all `(j|t)sx?` files under `src/pages` are treated as routes.

> You can find more explanations in [Convention-Based Routing](../guides/routes#convention-based-routing).

### base

`base` is used to set the base path for the conventional routes. By default, it reads from `src/pages`. This might need to be changed to `./docs` for documentation sites, for instance.

### exclude

You can use `exclude` to filter out files that don't need to be treated as routes, e.g., to exclude `components` and `models` directories.

Example:

```js
// Exclude files in the components and models directories from being recognized as routes
conventionRoutes: {
  exclude: [/\/components\//, /\/models\//],
}
```

## copy

- Type: `Array<string | { from: string; to: string; }>`
- Default: `[]`

Configures files or directories to be copied to the output directory.

When specifying a string, the file or directory will be copied to the build output directory. For example:

```ts
copy: ['foo.json', 'src/bar.json']
```

This results in the following structure in the output:

```
+ dist
  - bar.json
  - foo.json
+ src
  - bar.json
- foo.json
```

You can also use objects to specify specific copy locations, where relative paths are based on the project root:

```ts
copy: [
  { from: 'from', to: 'dist/output' },
  { from: 'file.json', to: 'dist' }
]
```

This results in the following structure:

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
- Default: `false`

Configures the `crossorigin` attribute of `script` tags. If defined, it adds the `crossorigin="anonymous"` attribute to local scripts.

Regarding parameters, the `includes` parameter can be used to add this attribute to additional non-local `script` tags.

For example:

```
crossorigin: {}
```

This will result in the following change in the output HTML:

```diff
-
<script src="/umi.js"></script>
+
<script src="/umi.js" crossorigin="anonymous"></script>
```

## cssMinifier

- Type: `string` Possible values: `esbuild`, `cssnano`, `parcelCSS`, `none`
- Default: `esbuild`

Configures the CSS minification tool to use during the build; `none` means no minification.

Example:

```js
{
  cssMinifier: 'esbuild'
}
```

## cssMinifierOptions

- Type: `Object`
- Default: `{}`

Configures options for the `cssMinifier` CSS minification tool.

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

Refer to the respective CSS minification documentation for the corresponding configuration.

- [esbuild reference](https://esbuild.github.io/api/#minify)
- [cssnano reference](https://cssnano.co/docs/config-file/)
- [parcelCSS reference](https://github.com/parcel-bundler/parcel-css/blob/master/node/index.d.ts)

## cssLoader

- Type: `object`
- Default: `{}`

Configures the `css-loader`, see [css-loader > options](https://github.com/webpack-contrib/css-loader#options).

## cssLoaderModules

- Type: `object`
- Default: `{}`

Configures the behavior of CSS modules, see [css-loader > modules](https://github.com/webpack-contrib/css-loader#modules).

For example:

```ts
cssLoaderModules: {
  // Configure to use camelCase
  exportLocalsConvention: 'camelCase'
}
```

## deadCode

- Type: `{ patterns?: string[]; exclude?: string[]; failOnHint?: boolean; detectUnusedFiles?: boolean; detectUnusedExport?: boolean; context?: string }`
- Default: `false`

Detects unused files and exports during the build phase. This is enabled only during the build process.

For example:

```
deadCode: {}
```

When running the build, if any issues are detected, a warning will be printed:

```
Warning: There are 1 unused files:
 1. /pages/index.module.less
 Please be careful if you want to remove them (¬º-°)¬.
```

Configuration options:

 - `patterns`: Defines the scope of code recognition, e.g., `['src/pages/**']`.
 - `exclude`: Excludes specific files from detection, e.g., `['src/pages/utils/**']`.
 - `failOnHint`: Specifies whether the build process should fail if issues are detected. Default is `false` (no failure).
 - `detectUnusedFiles`: Specifies whether to detect unused files. Default is `true`.
 - `detectUnusedExport`: Specifies whether to detect unused exports. Default is `true`.
 - `context`: Specifies the starting directory for matching. Defaults to the project root directory.

## define

- Type:

 `Record<string, string>`
- Default: As shown below

```
  { 
    'process.env.NODE_ENV' : process.env.NODE_ENV,
    'process.env.HMR' : process.env.HMR, 
    'process.env.SOCKET_SERVER': process.env.ERROR_OVERLAY' 
  }
```

Sets available variables in the code based on the [define-plugin](https://webpack.js.org/plugins/define-plugin/) plugin.

<Message type="warn" emoji="🚨" >
1. The property values will undergo a `JSON.stringify` transformation.
2. The key replacement is done using syntax, so configuring `{'a.b.c': 'abcValue'}` won't replace `a.b?.c` in the code.
</Message>

For example:

```
define: { FOO: 'bar' }
```

This will compile `console.log(hello, FOO)` in the code to `console.log(hello, 'bar')`.

When using these variables in a TypeScript project, you need to declare their types in a typings file to support type hinting. For example:

If your typings file is global:

```ts
// typings.d.ts
declare const FOO: string;
```

If your typings file is not global (includes import/export):

```ts
// typings.d.ts
import './other.d.ts';

declare global {
 const FOO: string;
}
```
## devtool

- Type: `string`
- Default: For dev, default is `cheap-module-source-map`. For build, default is no sourcemap.

Set the source map generation method.

Common options:

- `eval`, the fastest type, but not supported by older browsers.
- `source-map`, the slowest but most comprehensive type.

Example,

```js
// Turn off source map generation during development
devtool: false;

// Only set source map for development
devtool: process.env.NODE_ENV === 'development' ? 'eval' : false;
```

## classPropertiesLoose
- Type: `object`
- Default: `{}`

Enable loose mode for Babel class properties.

## esbuildMinifyIIFE

- Type: `boolean`
- Default: `false`

Resolve naming conflicts caused by automatically injected global variables by the esbuild minifier.

Umi 4 defaults to using esbuild as the minifier, which injects global variables as polyfills. This can lead to issues such as conflicts with global variables in asynchronous blocks, conflicts between qiankun sub-apps and main apps, etc. Enabling this option or switching the [`jsMinifier`](#jsminifier-webpack) minifier can solve these problems.

For more information, see [vite#7948](https://github.com/vitejs/vite/pull/7948).

Example,
```ts
esbuildMinifyIIFE: true
```

## externals

- Type: `Record<string, string> | Function`
- Default: `{}`

Specify which modules should not be bundled, and should be instead loaded via `<script>` or other methods. Typically used in conjunction with the `headScripts` configuration.

Example,

```
// Externalize React
externals: { react: 'React' },
headScripts: ['https://unpkg.com/react@17.0.1/umd/react.production.min.js'],
```

Note: Be cautious when setting externals for Ant Design (antd), as it has complex dependencies and usage patterns that might lead to issues that are not easy to explain in a few sentences.

## extraBabelIncludes

- Type: `Array<string | RegExp>`
- Default: `[]`

Configure additional NPM packages or directories that need to be compiled by Babel. Example:

```js
export default {
  extraBabelIncludes: [
    // Absolute path
    join(__dirname, '../../common'),
    // npm package
    'react-monaco-editor',
    // Compile all paths with @scope
    /@scope/
  ],
};
```

## extraBabelPlugins

- Type: `string[] | Function`
- Default: `[]`

Configure additional Babel plugins. You can provide plugin names or plugin functions.

## extraBabelPresets

- Type: `string[] | Function`
- Default: `[]`

Configure additional Babel presets. You can provide preset names or preset functions.

## extraPostCSSPlugins

- Type: `PostCSSPlugin[]`
- Default: `[]`

Configure additional PostCSS plugins.

## exportStatic

- Type: `{ extraRoutePaths: IUserExtraRoute[] | (() => IUserExtraRoute[] | Promise<IUserExtraRoute[]>) }`
- Default: `undefined`

When enabled, each route will generate a separate HTML file, typically used for static site hosting. For example, if you have the following routes:

```bash
/
/docs
/docs/a
```

Without enabling `exportStatic`, the output would be:

```bash
dist/index.html
```

With `exportStatic` enabled, the output would be:

```bash
dist/index.html
dist/docs/index.html
dist/docs/a/index.html
```

You can use the `extraRoutePaths` sub-config to generate additional pages, commonly used for dynamic route staticization. For example, with the following route:

```bash
/news/:id
```

By default, only `dist/news/:id/index.html` would be generated. However, you can use the `extraRoutePaths` configuration to staticize it:

```ts
// .umirc.ts
export default {
  exportStatic: {
    // Configure fixed values
    extraRoutePaths: ['/news/1', '/news/2'],
    // You can also use a function to dynamically generate routes
    extraRoutePaths: async () => {
      const res = await fetch('https://api.example.com/news');
      const data = await res.json();
      return data.map((item) => `/news/${item.id}`);
    },
  },
}
```

This would result in the following output:

```bash
dist/news/:id/index.html
dist/news/1/index.html
dist/news/2/index.html
```

In addition to strings, `extraRoutePaths` also supports an array of objects. This is useful for enabling SSR while disabling pre-rendering for certain routes, such as:

```ts
// .umirc.ts
export default {
  exportStatic: {
    // Generate extra page files but skip pre-rendering
    extraRoutePaths: [{ path: '/news/1', prerender: false }],
  },
}
```


## favicons

- Type: `string[]`
- Default: `null`

By default, the site will use the conventional [`favicon`](../guides/directory-structure#favicon) to create the icon's meta tags.

You can customize this using the following approach:

```js
favicons: [
  // Full URL
  'https://domain.com/favicon.ico',
  // This will point to `/favicon.png`. Make sure your project contains `public/favicon.png`
  '/favicon.png'
]
```

## forkTSChecker

- Type: `object`
- Default: `null`

Enable TypeScript type checking. Based on `fork-ts-checker-webpack-plugin`, you can refer to the [Options of fork-ts-checker-webpack-plugin](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options) for configuration options.

## hash

- Type: `boolean`
- Default: `false`

Enable hash mode to include a hash suffix in build artifacts. Typically used for incremental releases and to avoid browser caching.

When enabled, build artifacts would look like:

```
+ dist
    - logo.sw892d.png
    - umi.df723s.js
    - umi.8sd8fw.css
    - index.html
```

Note: HTML files always lack a hash suffix.

## headScripts

- Type: `string[] | Script[]`
- Default: `[]`

Configure additional script tags in the `<head>` section.

For example,

```js
headScripts: [`alert(1);`, `https://a.com/b.js`],
```

This would generate HTML:

```html
<script>
  alert(1);
</script>
<script src="https://a.com/b.js"></script>
```

If you need additional attributes, switch to the object format. For example,

```js
headScripts: [
  { src: '/foo.js', defer: true },
  { content: `alert('Hello');`, charset: 'utf-8' },
],
```

## helmet

- Type: `boolean`
- Default: `true`

Configure integration with `react-helmet-async`. When set to `false`, `react-helmet-async` integration

 is disabled. This means you cannot use `import { Helmet }` from the framework, and the resulting build size will be reduced as well.

## history

- Type: `{ type: 'browser' | 'hash' | 'memory' }`
- Default: `{ type: 'browser' }`

Set the routing history type.

## historyWithQuery

- Type: `‌{}`
- Default: `false`

Include query parameters in the history. Apart from navigation using `useNavigate`, you also need to manually handle query parameters in this scenario.

## https

- Type: `{ cert: string; key: string; hosts: string[]; http2?: boolean }`
- Default: `{ hosts: ['127.0.0.1', 'localhost'] }`

Enable HTTPS mode during development. Umi 4 uses [`mkcert`](https://github.com/FiloSottile/mkcert) for quickly creating certificates. Make sure it is installed.

Parameters:

- `cert` and `key` are used to specify certificate and key files.
- `hosts` specifies the hosts that support HTTPS access. Default is `['127.0.0.1', 'localhost']`.
- `http2` specifies whether to use HTTP 2.0 protocol. Default is true (using HTTP 2.0 in Chrome or Edge browsers might occasionally result in `ERR_HTTP2_PROTOCOL_ERROR` errors; if encountered, consider setting it to false).

Example,

```js
https: {
}
```

## icons

- Type: `{ autoInstall: {}; alias: Record<string,string>; include: Array<string>;  }`
- Default: `false`

Quickly reference icon sets or local icons using the Icon component provided by Umi.

### Using icon sets

In the Umi configuration file, enable the icons feature and allow automatic installation of icon collections.

```ts
icons: { autoInstall: {} },
```

Usage in pages:

```ts
import { Icon } from 'umi';
<Icon icon="fa:home" />
```

The icon strings contain a combination of `collect:icon`, separated by `:`. Icon collections are recommended to be searched on the [Icônes website](https://icones.js.org/).

## Local icon usage

In the Umi configuration file, enable the icons feature.

```ts
icons: {},
```

To use local SVG icons, save the SVG files in the `src/icons` directory. Then, reference them using the `local` prefix. For example, if there's an `umi.svg` in the `src/icons` directory, you can use it like this:

```tsx
import { Icon } from 'umi';
<Icon icon="local:umi" />
```

### Configuration Options

- `autoInstall`: Specifies whether to automatically install icon sets. tnpm/cnpm clients are currently not supported, but you can manually install the corresponding icon set package `@iconify-json/collection-name`. Refer to the [Icon Collection List](https://github.com/iconify/icon-sets/blob/master/collections.md), where `collection-name` corresponds to the ***Icon set prefix*** in the list.
- `alias`: Configures alias names for icons. For example, after configuring `alias:{home:'fa:home'}`, you can use the `icon="home"` to use the `fa:home` icon.
- `include`: Configures icons that need to be forcibly used, such as `include: ['fa:home', 'local:icon']`. A common use case is when you define icon strings in a map, causing them not to be detected; or when using the `Icon` component in `mdx`.

### Icon Component Props

- icon: Specifies the icon.
- width: SVG width.
- height: SVG height.
- viewBox: SVG viewBox.
- style: External container style.
- className: External container class name.
- spin: Specifies whether to auto-rotate.
- rotate: Configures the rotation angle, supports various formats such as `1`, `"30deg"`, `"25%"`.
- flip: Supports `vertical`, `horizontal`, or their combination `vertical,horizontal`.

## ignoreMomentLocale

- Type: `boolean`
- Default: `true`

Ignore moment locale files to reduce the artifact size.

Note: This feature is enabled by default. Configure `ignoreMomentLocale: false` to disable it.

## inlineLimit

- Type: `number`
- Default: `10000` (10k)

Configure the threshold for whether image files should be compiled as base64. Default is 10,000 bytes. Files smaller than this size will be compiled as base64, while larger files will be generated as separate files.

## jsMinifier (webpack)

- Type: `string`, Options: `esbuild`, `terser`, `swc`, `uglifyJs`, `none`
- Default: `esbuild`

Configure the JavaScript minification tool for the build. `none` indicates no minification.

Example:

```ts
{
  jsMinifier: 'esbuild'
}
```

## jsMinifierOptions

- Type: `object`
- Default: `{}`

Configuration options for `jsMinifier`. By default, minifying code removes comments. You can retain comments by using the corresponding `jsMinifier` option.

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

The configuration options should match the tool you are using, refer to their respective documentation:

- [esbuild Reference](https://esbuild.github.io/api/#minify)
- [terser Reference](https://terser.org/docs/api-reference#minify-options)
- [swc Reference](https://swc.rs/docs/configuration/minification#configuration)
- [uglifyJs Reference](https://lisperator.net/uglifyjs/compress)

{
/*
## jsMinifier (vite build)

* Type: `string`
* Default:

*/
}

## lessLoader

- Type: `Object`
- Default: `{ modifyVars: userConfig.theme, javascriptEnabled: true }`

Configure options for `less-loader`. Refer to [less-loader Options](https://github.com/webpack-contrib/less-loader#lessoptions) for details.

> By default, less@4 is used. If you need compatibility with less@3, configure to use [less-options-math](https://lesscss.org/usage/#less-options-math).

## legacy

- Type: `{ buildOnly?: boolean; nodeModulesTransform?: boolean; checkOutput?: boolean; }`
- Default: `false`

When you need to support older browsers, you might need this option. When enabled, the build tool will use the **non-modern** bundler, which significantly increases the build time.

```ts
legacy: {}
```

By default, it only applies during build. You can turn off the `buildOnly` restriction by setting `buildOnly: false`.

By setting `checkOutput: true`, it will automatically run [`es-check`](https://github.com/yowainwright/es-check) to check if the syntax of `.js` files in the artifacts adheres to es5 format after each build.

With this option enabled:

- Custom `srcTranspiler`, `jsMinifier`, and `cssMinifier` options are not supported.
- It will transpile all sources in `node_modules` with targets compatible with IE 11. You can use `nodeModulesTransform: false` to skip transforming `node_modules` and use `extraBabelIncludes` to selectively transpile specific problematic packages.
- As older browsers do not support Top level await, ensure that you do not use both asynchronous and synchronous imports in the same dependency when using `externals`, unless `externalsType` with an asynchronous nature is used.

## links

- Type: `Link[]`
- Default: `[]`

Configure additional link tags.

For example,

```js
links: [{ href: '/foo.css', rel: 'preload' }],
```

## manifest

- Type: `{ fileName: string; basePath: string }`
- Default: `null`

Generate an additional manifest file during build to describe artifacts. 

Parameters: `fileName`: Specifies the file name of the generated manifest. Default is `asset-manifest.json`; `basePath`: Adds a prefix to all file paths.

Note: Only generated during build.

## mdx

- Type: `{ loader: string; loaderOptions: Object }`
- Default: `{}`

Configure the mdx loader. The `loader` specifies the path to the loader configuration, and `loaderOptions` specifies the loader options.

## metas

- Type: `Meta[]`
- Default: `[]`

Configure additional meta tags.

For example,

```js
metas: [
  { name: 'keywords', content: 'umi, umijs' },
  { name: 'description', content: 'React framework.' },
],
```

Would generate the following HTML:

```html
<meta name="keywords" content="umi, umijs" />
<meta name="description" content="React framework." />
```

## mfsu

- Type: `{ esbuild: boolean; mfName: string; cacheDirectory: string; strategy: 'normal' | 'eager'; include?: string[]; chainWebpack: (memo, args) => void; exclude?: Array<string | RegExp> }`
- Default: `{ mfName: 'mf', strategy: 'normal' }`

Configure the performance optimization feature based on [Module Federation](https://module-federation.github.io/).

Parameters:

- `esbuild`: When set to `true`, it uses esbuild for dependency pre-compilation, making the initial startup faster. The drawback is that there won't be physical caching for subsequent compilations, making them slightly slower. Recommended for projects with relatively stable dependencies.
- `mfName`: The global variable for remote libraries in this approach. The default is `mf`, and it's usually configured to avoid conflicts between the main app and sub-applications in a micro-frontend setup.
- `cacheDirectory`: Customize the cache directory. The default is `node_modules/.cache/mfsu`.
- `chainWebpack`: Use webpack-chain to modify the webpack configuration for dependencies. This function is provided with two arguments, `memo` (the current configuration) and `args` (other arguments). For detailed API reference, see [webpack-chain Documentation](https://github.com/sorrycc/webpack-chain).
- `runtimePublicPath`: Changes the `publicPath` of the loading files for modules in Module Federation to `window.publicPath`.
- `strategy`: Specifies when mfsu should build dependencies. In `normal` mode, the dependencies are built based on babel analysis and then used in the Module Federation remote bundle. In `eager` mode, the dependencies are built based on static analysis and are built concurrently with the project code.
- `include`: Only works in `strategy: 'eager'` mode. It's used to compensate for dependencies that couldn't be statically analyzed in eager mode. For example, if `react` is not included in the remote module, you can configure `{ include: [ 'react' ] }`.
- `exclude`: Manually exclude certain dependencies that should not be processed by MFSU. It can be a string or a regular expression. For example, `{ exclude: [ 'vant' ] }` will exclude the `vant` library from MFSU processing.

Example,

```js
// Use esbuild for dependency pre-compilation
mfsu: {
  esbuild: true,
}

// Disable MFSU
mfsu: false;
```

```js
// Modify webpack configuration
mfsu: {
  chainWebpack(memo, args) {
    // Add additional plugins
    memo.plugin('hello').use(Plugin, [...args]);
    return memo;
  }
}
```

Note: This feature is enabled by default. Configure `mfsu: false` to disable it.

## mock

- Type: `{ exclude: string[], include: string[] }`
- Default: `{}`

Configure the mock feature.

Parameters:

- `exclude`: Excludes mock files that are not needed.
- `include`: Adds mock files outside the mock directory.

Example,

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

Configure the HTML element ID where the React component tree should be rendered.

Example,

```js
mountElementId: 'container'
```

## monorepoRedirect

- Type: `{ srcDir?: string[], exclude?: RegExp[], peerDeps?: boolean }`
- Default: `false`

When using Umi within a monorepo, you might need to import components, utility methods, etc., from other sub-packages. You can enable this option to redirect imports from these sub-packages to their source code locations (by default, the `src` folder). This can also solve the issue of non-hot updates in the `MFSU` scenario.

The benefit of this redirection is that it supports hot updates, allowing you to develop without pre-building other sub-packages.

Adjust the recognition priority of the source code folder by configuring `srcDir` and set the dependency scope that should not be redirected using `exclude`.

Examples:

```js
// Default redirection to the src folder of the sub-packages
monorepoRedirect: {}
// Look within the sub-package and prioritize redirection to the libs folder
monorepoRedirect: {
  srcDir: ['libs', 'src'],
}
// Do not redirect sub-packages under @scope/*
monorepoRedirect: {
  exclude: [/^@scope\/.+/],
}
```

In large-scale business monorepos, each sub-package's dependencies are loaded starting from their directories to `node_modules`. However, during local development, dependencies are installed in `devDependencies`, which is inconsistent with installing from npm. As a result, multiple instances of the same dependency can be encountered.

<Message fontsize='small'>
For example, each sub-package requires `antd` during local development, which is installed in `devDependencies` and also specified in `peerDependencies`. When the package is expected to be installed via npm and used by a project, `antd` should be a project's own dependency, unique globally. However, in a monorepo, dependencies specified in `devDependencies` are always present, and sub-packages search for dependencies from within themselves. This leads to each sub-package using its own instance of `antd`, causing multiple copies of `antd` in the build, increased build size, disruption of message queues, and other issues.
</Message>

To address this problem, we have a convention:

When the `peerDeps` option is enabled, all `peerDependencies` specified in sub-packages are automatically added as `alias` to ensure uniqueness and avoid multiple instances:

```ts
monorepoRedirect: { peerDeps: true }
```

With redirection in place, the dependencies are unique globally, and the development experience can be consistent with installing packages from npm.

## mpa

- Type: `object`
- Default: `false`

Enable the [mpa mode](../guides/mpa).

## outputPath

- Type: `string`
- Default: `dist`

Configure the output path.

Note: Not allowed to be set to directories related to conventional functionalities like src, public, pages, mock, config, locales, models, etc.

## phantomDependency

- Type: `{ exclude: string[] }`
- Default: `false`

Perform phantom dependency detection.

When using undeclared dependencies in `package.json`, and no configuration is provided through alias or externals, an error will be thrown with a reminder.

![](https://mdn.alipayobjects.com/huamei_ddtbzw/afts/img/A*k5uoQ5TOPooAAAAAAAAAAAAADkCKAQ/original)

If whitelist handling is needed, it can be achieved through the `exclude` configuration, where the excluded items are the package names of npm dependencies.

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

Items in the array are paths pointing to the plugins, which can be npm dependencies, relative paths, or absolute paths. If it's a relative path, it will be searched from the project's root directory.

Examples:

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

Set up on-demand imports of polyfills. Defaults to importing all.

For example, import only the stable part of core-js:

```js
polyfill: {
  imports: ['core-js/stable'],
}
```

If there's a need for more performance optimization, you can consider importing on-demand:

```js
polyfill: {
  imports: ['core-js/features/promise/try', 'core-js/proposals/math-extensions'],
}
```

Note: This feature is enabled by default. To disable it, set `polyfill: false` or use the environment variable `BABEL_POLYFILL=none`.

## postcssLoader

- Type: `object`
- Default: `{}`

Configure options for [postcss-loader](https://github.com/webpack-contrib/postcss-loader#options).

## presets

- Type: `string[]`
- Default: `[]`

Configure additional Umi plugin sets.

Items in the array are paths pointing to the plugin sets, which can be npm dependencies, relative paths, or absolute paths. If it's a relative path, it will be searched from the project's root directory.

Examples:

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

Then, accessing `/api/users` will fetch data from http://jsonplaceholder.typicode.com/users.

Note: Proxy functionality only works during development (`dev` mode).

## publicPath

- Type: `string`
- Default: `/`

Configure webpack's publicPath.

## reactRouter5Compat

- Type: `object`
- Default: `false`

Enable react-router 5 compatibility mode. In this mode, the route component's props will include `location`, `match`, `history`, and `params` properties, consistent with react-router 5.

However, note that:

1. This mode introduces additional re-renders.
2. Due to the updated dependency library history, the `query` property is not present in the `location`.

## routes

- Type: `Route[]`
- Default: `[]`

Configure routes. For more information, see [Configuring Routes](../guides/routes#配置路由).

## routeLoader

- Type: `{ moduleType: 'esm' | 'cjs' }`
- Default: `{ moduleType: 'esm' }`

Configure the route loading method. When `moduleType` is configured as 'cjs', route components will be loaded using the `require` method.

```ts
// moduleType: esm
'index': React.lazy(() => import(/* webpackChunkName: "p__index" */'../../pages/index.tsx')),

// moduleType: cjs
'index': React.lazy(() => Promise.resolve(require('../../pages/index.tsx'))),
```

## run

- Type: `{ globals: string[] }`
- Default: `null`

Global injection configuration for the run command. Adding `['zx/globals']` will automatically inject `import 'zx/globals';` when using `umi run ./script.ts`, eliminating the need to write `import 'zx/globals';` in every script.

## runtimePublicPath

- Type: `object`
- Default: `null`

Enable runtime publicPath, which uses `window.publicPath` as the starting path for dynamically loading resources.

For example:

```js
runtimePublicPath: {},
```

## scripts

- Type: `string[] | Script[]`
- Default: `[]`

Configure additional script tags in the `<body>`.

For example:

```js
scripts: [`alert(1);`, `https://a.com/b.js`],
```

This will generate HTML:

```html
<script>
  alert(1);
</script>
<script src="https://a.com/b.js"></script>
```

If additional attributes are needed, switch to the object format:

```js
scripts: [
  { src: '/foo.js', defer: true },
  { content: `alert('你好');`, charset: 'utf-8' },
],
```

## sassLoader

- Type: `object`
- Default: `{}`

Configure sass-loader, details in [sass-loader > options](https://github.com/webpack-contrib/sass-loader#options).

## styleLoader

- Type: `object`
- Default: `false`

Enable style loader functionality to inline CSS into JS, without generating separate CSS files.

## styles

- Type: `string[]`
- Default: `[]`

Configure additional CSS.

Items in the configuration array can include inline styles and external style paths, with external styles determined by whether they start with https?://.

The inserted styles will be prefixed and have lower priority than user-written styles in the project.

For example:

```js
styles: [`body { color: red; }`, `https://a.com/b.css`],
```

This will generate the following HTML:

```html
<style>
  body {
    color: red;
  }
</style>
<link rel="stylesheet" href="https://a.com/b.css" />
```

## srcTranspiler

- Type: `string`, optional values: `babel`, `swc`, `esbuild`, `none`
- Default: `babel`

Configure the tool for transpiling js/ts during build.

## srcTranspilerOptions

- Type: `{ swc?: SwcConfig, esbuild?: EsbuildConfig }`
- Default: `undefined`

If you are using `swc` / `esbuild` as the `srcTranspiler` transpiler, you can further configure the transpiler using this option. Refer to the [SwcConfig](https://swc.rs/docs/configuration/swcrc) and [EsbuildConfig](https://esbuild.github.io/api/#transform-api) configuration documents.

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

By default, svgr is enabled, supporting the usage of React SVG components in the following way:

```ts
import SmileUrl, { ReactComponent as SvgSmile } from './smile.svg';
```

Configuration of svgr's behavior is possible, with configuration options detailed in [@svgr/core > Config](https://github.com/gregberge/svgr/blob/main/packages/core/src/config.ts#L9).

## svgo

- Type: `object`
- Default: `{}`

svgo is used by default to optimize SVG resources, with configuration options detailed in [svgo](https://github.com/svg/svgo#configuration).

## targets

- Type: `object`
- Default: `{ chrome: 80 }`

Configure the minimum required versions of browsers for compatibility. Umi will automatically introduce polyfills, configure autoprefixer, and perform syntax transformations based on this configuration.

Example:

```js
// Compatibility with IE11
targets: {
  ie: 11;
}
```

## theme

- Type: `object`
- Default: `{}`

Configure Less variable themes.

Example:

```js
theme: { '@primary-color': '#1DA57A' }
```

## title

- Type: `string`
- Default: `null`

Configure the global page title. Currently, only static titles are supported.

## verifyCommit

- Type: `{ scope: string[]; allowEmoji: boolean }`
- Default: `{ scope: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'workflow', 'build', 'ci', 'chore', 'types', 'wip', 'release', 'dep', 'deps', 'example', 'examples', 'merge', 'revert'] }`

Configuration options for the verify-commit command.

Regarding parameters: `scope` is used to configure allowed scopes, case-insensitive. Configuring this will override the defaults. `allowEmoji`, when enabled, allows the use of EMOJI prefixes, such as `💥 feat(module): added an awesome feature`.

```
verifyCommit: {
  scope: ['feat', 'fix'],
  allowEmoji: true,
}
```

Note: Commit messages generated by `git revert` or `git merge` commands, as well as the merge format of `changesets`, will pass verification by default.

## vite

- Type: `object`
- Default: `{}`

Developer configurations will be merged into vite's [default configuration](https://vitejs.dev/config/).

Example:

```js
// Change the temporary file path to the node_modules/.bin/.vite folder
vite: {
  cacheDir: 'node_modules/.bin/.vite',
}
```

## writeToDisk

- Type: `boolean`
- Default: `false`

When enabled, an additional copy of files will be output to the dist directory during development (`dev` mode). This is usually used in development scenarios like Chrome extensions, Electron applications, Sketch plugins, etc.

