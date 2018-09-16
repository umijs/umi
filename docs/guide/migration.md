# Migrate from umi 1.x

> More like watching videos? You can [click here to watch](https://youtu.be/1mvKzFLLBck).

Let's take an example of [antd-admin](https://github.com/zuiidea/antd-admin/pull/877) to update from umi@1 to umi@2.

## npm Dependency

Upgrade umi to `^2.0.0-0` and use umi-plugin-react instead of the previous plugins, including umi-plugin-dva, umi-plugin-dll, umi-plugin-routes, umi-plugin-polyfill and Umi-plugin-locale.

```diff
- "umi": "^1.3.17",
+ "umi": "^2.0.0-beta.16",

- "umi-plugin-dll": "^0.2.1",
- "umi-plugin-dva": "^0.9.1",
- "umi-plugin-routes": "^0.1.5"
+ "umi-plugin-react": "^1.0.0-beta.16",
```

Umi-plugin-react is a collection of more than a dozen plugins, as described in [Introduction to umi-plugin-react](/plugin/umi-plugin-react.html).

## Environment Variables

Umi@2 supports configuring environment variables in `.env`, so the environment variables previously written in package.json scripts can be cut here.

```diff
- "start": "cross-env COMPILE_ON_DEMAND=none BROWSER=none HOST=0.0.0.0 umi dev",
+ "start": "cross-env BROWSER=none HOST=0.0.0.0 umi dev",
```

Then create a new `.env`, (where `COMPILE_ON_DEMAND` is no longer supported)

```
BROWSER=none
HOST=0.0.0.0
```

In addition, some environment variables have changed or are no longer supported:

* `PUBLIC_PATH` is no longer supported, configured by `publicPath`
* `BASE_URL` is no longer supported, configured by `base`
* `COMPILE_ON_DEMAND` is no longer supported, and this function is not available in umi@2.
* `TSLINT` is no longer supported, and this function is not available in umi@2.
* `ESLINT` is no longer supported, and this function is not available in umi@2.

## Configuration

### Plugin Configuration

Since we changed a lot of plugins to umi-plugin-react, we need to modify `.umirc.js`.

```diff
export default {
  plugins: [
-    'umi-plugin-dva',
+    ['umi-plugin-react', {
+      dva: true,
+      antd: true,  // antd is not enabled by default, if you need to use it yourself
+    }],
  ],
};
```

For more dll, hardSource, polyfilles, locale, title, etc., refer to [umi-plugin-react documentation](/plugin/umi-plugin-react.html).

### webpackrc.js

Umi@2 no longer supports `webpackrc.js`, copy the configuration inside it to `.umirc.js`.

### webpack.config.js

Umi@2 no longer supports `webpack.config.js`, instead it is implemented by configuring [chainWebpack](/config/#chainwebpack).

### Detailed Configuration Item Changes

* `hd` is no longer supported. To enable it, load the plugin `umi-plugin-react` and configure `hd: {}`
* `disableServiceWorker` is no longer supported, it is not enabled by default. To enable it, load the plugin `umi-plugin-react` and configure `pwa: {}`
* `preact` is no longer supported. To configure, load the plugin `umi-plugin-react` and configure `library: 'preact'.
* `loading` is no longer supported. To configure, load the plugin `umi-plugin-react` and configure `dynamicImport.loadingComponent`
* `hashHistory: true` changed to `history: 'hash'`
* `disableDynamicImport` is no longer supported, it is not enabled by default. To enable it, load the plugin `umi-plugin-react` and configure `dynamicImport: {}`
* `disableFastClick` is no longer supported, it is not enabled by default. To enable it, load the plugin `umi-plugin-react` and configure `fastClick: {}`
* No longer supports `pages`, instead of directly on the route
* `disableHash` is no longer supported, it is not enabled by default. To enable it, configure `hash: true`

## Conventional Routing

The routing layer no longer supports directory-level routing for `page.js`. Previously useful, you need to exclude unwanted routes through umi-plugin-react's routes.exclude.

## umi/dynamic

Interface changes, umi@2 is based on [react-loadable](https://github.com/jamiebuilds/react-loadable).

```diff
- dynamic(async () => {})
+ dynamic({ loader: async () => {}})
```

See [umi/dynamic Interface Description](/api/#umi-dynamic) for details.
