## FAQ

### Can I disable `dynamicImport`?

Yes, you can disable it, but it's not recommended.

1. Install the dependency:

```bash
pnpm i babel-plugin-dynamic-import-node -D
```

2. Add the `extraBabelPlugins` configuration in your `.umirc.ts` to apply the plugin only in production:

```ts
// .umirc.ts
export default {
  extraBabelPlugins: process.env.NODE_ENV === 'production' 
    ? ['babel-plugin-dynamic-import-node'] 
    : []
}
```

### How do I configure the loading when using `dynamicImport`?

Define a `src/loading.tsx` file:

Refer to [Directory Structure > loading.tsx](../guides/directory-structure#loadingtsxjsx).

### Can I use React 17?

Umi v4 upgrades the default React version to v18. If you want to use React 17, execute the following command and restart:

```bash
pnpm add react@^17 react-dom@^17
```

### After proxying static resources to my local server, the page keeps restarting when refreshed.

<img src={require('./img/rstart.png')} />

Solution: Configure `SOCKET_SERVER=127.0.0.1:${port}` when starting the project:

```bash
SOCKET_SERVER=http://127.0.0.1:8000 pnpm dev
```

### Error evaluating function `round`: argument must be a number

<img src={require('./img/less-error.png')} />

Solution: In the new version of Less, `/` is recognized as an attribute shorthand. To revert to the old behavior (treating `/` as a calculation symbol), configure `lessLoader: { math: 'always' }`.

### The `layout` configuration option in `routes` doesn't work.

The `layout` configuration has been moved to `app.ts`. Refer to [Runtime Configuration > layout](https://umijs.org/docs/api/runtime-config#layout).

### Where is `document.ejs`, and how do I customize the HTML template?

In addition to injecting external [scripts](https://umijs.org/docs/api/config#scripts) and [styles](https://umijs.org/docs/api/config#styles) through configuration, you can use project-level plugins to modify the HTML output more flexibly. See [issuecomment-1151088426](https://github.com/umijs/umi-next/issues/868#issuecomment-1151088426).

### The external JavaScript file configured in `scripts` is inserted after `umi.js`. Why is that?

React only starts running after the page has loaded completely, so inserting it after `umi.js` doesn't affect the project.

If you need to insert it before `umi.js`, refer to [issuecomment-1176960539](https://github.com/umijs/umi/issues/8442#issuecomment-1176960539).

### How do I bundle packages in Umi 4?

Umi 4 by default splits bundles by page. If you feel the need for further optimization, you can use code splitting strategies or manually split bundles. Refer to [Code Splitting Guide](../../blog/code-splitting).

If you have a requirement to bundle all JavaScript artifacts into a single `umi.js` file, you need to disable [dynamicImport](#can-i-disable-dynamicimport).

### Where is `_layout.tsx`, and how do I implement nested routing?

Umi 4 uses React Router v6. Use the `<Outlet />` component to display content for nested routing. Refer to [issuecomment-1206194329](https://github.com/umijs/umi/issues/8850#issuecomment-1206194329).

### How can I use GraphQL?

For configuration of the `graph-ql` loader, refer to [discussions/8218](https://github.com/umijs/umi/discussions/8218).

### How can I use WebAssembly?

Configure as follows:

```ts
// .umirc.ts

export default {
  chainWebpack(config) {
    config.set('experiments', {
      ...config.get('experiments'),
      asyncWebAssembly: true
    })

    const REG = /\.wasm$/

    config.module.rule('asset').exclude.add(REG).end();

    config.module
      .rule('wasm')
      .test(REG)
      .exclude.add(/node_modules/)
      .end()
      .type('webassembly/async')
      .end()
  },
}
```

An actual example can be found here: [discussions/8541](https://github.com/umijs/umi/discussions/8541).

### How can I customize loaders?

Depending on the scenario, you might need to exclude the file types you want to load from the static resource rules and then add your own loaders or modify existing ones. See examples:

- [discussions/8218](https://github.com/umijs/umi/discussions/8218)

- [discussions/8452](https://github.com/umijs/umi/discussions/8452)

### How do I use CSS modules in third-party packages?

1. Publish the source code of the third-party package's `jsx` / `ts` / `tsx` as-is to npm. No need to transpile to `js`. Umi 4 supports direct usage.

2. If the third-party package's artifacts are `js`, you need to include them in Babel's extra handling for CSS modules:

```ts
// .umirc.ts
export default {
  extraBabelIncludes: ['your-pkg-name']
}
```

### Why doesn't my npm-linked package hot-reload?

Umi 4 enables `mfsu` by default, which ignores changes in `node_modules` by default. To make hot-reloading work with a linked package, exclude that package from `mfsu`:

```ts
// .umirc.ts

export default {
  mfsu: {
    exclude: ['package-name']
  },
}
```

### How do environment-specific config files work with multiple environments?

Refer to the [UMI_ENV](../../docs/guides/env-variables#umi_env) loading priority. The same applies whether you're using `config/config.ts` or `.umirc.ts`.

### How do I handle IE compatibility issues?

In the context of modern browsers, Umi 4 doesn't provide compatibility with IE by default.

If you need to adjust the build target, handle non-modern browsers, or provide IE compatibility, refer to [Legacy Browser Compatibility](../../blog/legacy-browser).

### SSR Issues

Server-side rendering (SSR) is still an experimental feature, and it's not recommended for production use. If you encounter issues, please provide feedback through [issues](https://github.com/umijs/umi/issues).

### Vue / Vite Issues

Umi 4 introduces Vite mode and Vue support, so there might be some edge cases. If you encounter issues, provide feedback through [issues](https://github.com/umijs/umi/issues).

### Why is the `pathname` value from `history` different from that of `useLocation`?

This occurs when the project is configured with a `base`. `history.location.pathname` returns the browser's address `pathname`, which includes the `base`. On the other hand, the `pathname` value returned by routing hooks is based on

 the frontend routing definition and doesn't include the `base`. [Refer to this](../guides/routes#location-information).

### Adjusting the Compression Encoding Format of Artifacts

The default `esbuild` compressor for JavaScript and CSS uses the `ascii` encoding format for compression, which can cause Chinese characters to be encoded and increase the artifact size. You can adjust the encoding format to `utf8` to prevent character conversion:

```ts
// .umirc.ts
export default {
  jsMinifierOptions: { charset: 'utf8' },
  cssMinifierOptions: { charset: 'utf8' }
}
```

Alternatively, you can switch compressors to resolve the issue:

```ts
// .umirc.ts
export default {
  jsMinifier: 'terser',
  cssMinifier: 'cssnano'
}
```

### How do I configure the `devServer` options?

Umi 4 no longer supports the `devServer` options, but you can find alternatives through:

1. Configuring the [`proxy`](../api/config#proxy) option for proxying. You can use `onProxyReq` to modify request headers. Refer to [#10760](https://github.com/umijs/umi/issues/10760#issuecomment-1471158059).

2. Writing [project-level plugins](../guides/use-plugins#项目级插件) to insert Express middleware to modify requests. Refer to [#10060](https://github.com/umijs/umi/issues/10060#issuecomment-1471519707).