---
---

# How to speed up compilation

If you encounter problems such as slow compilation, slow incremental compilation, memory burst, OOM, etc., you can try the following methods.

## Configure `nodeModulesTransform` as `{ type:'none' }`

> Demand Umi 3.1.

Umi compiles files under node\_modules by default, which not only brings some benefits, but also adds extra compilation time. If you don't want the files under node\_modules to be compiled with babel, you can reduce the compilation time by 40 % to 60% through the following configuration.

```js
export default {
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
}
```

## View package structure

When executing `umi dev` or `umi build`, increase the environment variable `ANALYZE=1` to view the product's dependency ratio.

<img src="https://img.alicdn.com/tfs/TB1P_iYDQL0gK0jSZFAXXcA9pXa-2432-1276.png" width="600" />

Notice:

* `umi dev` can be modified and viewed in real time, but some development dependencies will be introduced, please ignore

## Configuration externals

For some large-scale dependencies, such as chart libraries, antd, etc., you can try to import related umd files through the configuration of externals to reduce compilation consumption.

For example, react and react-dom:

```js
export default {
  // Configure external
  externals: {
    'react': 'window.React',
    'react-dom': 'window.ReactDOM',
  },

  // Import the scripts of the external library
  // distinguish development and production, use different products
  scripts: process.env.NODE_ENV ==='development'? [
    'https://gw.alipayobjects.com/os/lib/react/16.13.1/umd/react.development.js',
    'https://gw.alipayobjects.com/os/lib/react-dom/16.13.1/umd/react-dom.development.js',
  ] : [
    'https://gw.alipayobjects.com/os/lib/react/16.13.1/umd/react.production.min.js',
    'https://gw.alipayobjects.com/os/lib/react-dom/16.13.1/umd/react-dom.production.min.js',
  ],
}
```

Notice:

1. If you want to support IE10 or below, external react also needs to introduce additional patches, such as `https://gw.alipayobjects.com/os/lib/alipay/react16-map-set-polyfill/1.0.2/dist/react16 -map-set-polyfill.min.js`
2. If antd is external, additional moment, react and react-dom need to be external at the same time, and introduced before antd

## Reduce patch size

Umi will include patches for the following browsers and their versions by default,

```
chrome: 49,
firefox: 64,
safari: 10,
edge: 13,
ios: 10,
```

Choosing a suitable browser version can reduce a lot of size. For example, if it is configured as follows, it is expected to reduce the size of 90K (without gzip after compression).

```js
export default {
  targets: {
    chrome: 79,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
}
```

Notice:

* Set the browser to false to not include his patch

## Adjust the splitChunks strategy to reduce the overall size

If dynamicImport is turned on, and the product is very large, and each export file contains the same dependencies, such as antd, you can try to adjust the extraction strategy of common dependencies through the splitChunks configuration.

for example:

```js
export default {
  dynamicImport: {},
  chunks: ['vendors', 'umi'],
  chainWebpack: function (config, { webpack }) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test({ resource }) {
                return /[\\/]node_modules[\\/]/.test(resource);
              },
              priority: 10,
            },
          },
        },
      }
    });
  },
}
```

## Set the upper limit of memory through NODE\_OPTIONS

If OOM occurs, you can also try to solve it by increasing the upper memory limit. For example, `NODE_OPTIONS=--max_old_space_size=4096` is set to 4G.

## Adjust SourceMap generation method

If dev time is slow or incremental compilation is slow after modifying the code, you can try to disable SourceMap generation or adjust to a lower-cost generation method.

```js
// disable sourcemap
export default {
  devtool: false,
};
```

or,

```js
// Use the lowest cost sourcemap generation method, the default is cheap-module-source-map
export default {
  devtool: 'eval',
};
```

## monaco-editor editor package

The editor is packaged, it is recommended to use the following configuration to avoid build errors:

```js
import MonacoWebpackPlugin from'monaco-editor-webpack-plugin';

export default {
  chainWebpack: (memo) => {
    // More configuration https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    memo.plugin('monaco-editor-webpack-plugin').use(MonacoWebpackPlugin, [
      // Configure on demand
      { languages: ['javascript'] }
    ]);
    return memo;
  }
}
```

## Replace compressor with esbuild

> Experimental function, there may be pits, but the effect is outstanding.

Taking a project that relies on full antd and bizcharts as an example, the test was performed on the basis of disabling the Babel cache and Terser cache, and the effect is shown in the figure:

![](https://gw.alipayobjects.com/zos/antfincdn/NRwBU0Kgui/7f24657c-ec26-420b-b956-14ae4e3de0a3.png)

Install dependencies first,

```bash
$ yarn add @umijs/plugin-esbuild
```

Then turn it on in the configuration,

```js
export default {
  esbuild: {},
}
```

## No compression

> Not recommended, use in emergency situations.

Compression time accounts for most of the slow compilation, so if you do not compress during compilation, you can save a lot of time and memory consumption, but the size will increase a lot. Compression can be skipped through the environment variable `COMPRESS=none`.

```bash
$ COMPRESS=none umi build
```
