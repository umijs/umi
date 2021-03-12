---
translateHelp: true
---

# 如何做编译提速

如果遇到编译慢，增量编译慢，内存爆掉，OOM 等问题，可尝试以下方法。

## 配置 `nodeModulesTransform` 为 `{ type: 'none' }`

> 需要 Umi 3.1 。

Umi 默认编译 node_modules 下的文件，带来一些收益的同时，也增加了额外的编译时间。如果不希望 node_modules 下的文件走 babel 编译，可通过以下配置减少 40% 到 60% 的编译时间。

```js
export default {
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
};
```

## 查看包结构

执行 `umi dev` 或 `umi build` 时，增加环境变量 `ANALYZE=1` 可查看产物的依赖占比。

<img src="https://img.alicdn.com/tfs/TB1P_iYDQL0gK0jSZFAXXcA9pXa-2432-1276.png" width="600" />

注意：

- `umi dev` 可以实时修改和查看，但会引入一些开发依赖，注意忽略

## 配置 externals

对于一些大尺寸依赖，比如图表库、antd 等，可尝试通过 externals 的配置引入相关 umd 文件，减少编译消耗。

比如 react 和 react-dom：

```js
export default {
  // 配置 external
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
  },

  // 引入被 external 库的 scripts
  // 区分 development 和 production，使用不同的产物
  scripts:
    process.env.NODE_ENV === 'development'
      ? [
          'https://gw.alipayobjects.com/os/lib/react/16.13.1/umd/react.development.js',
          'https://gw.alipayobjects.com/os/lib/react-dom/16.13.1/umd/react-dom.development.js',
        ]
      : [
          'https://gw.alipayobjects.com/os/lib/react/16.13.1/umd/react.production.min.js',
          'https://gw.alipayobjects.com/os/lib/react-dom/16.13.1/umd/react-dom.production.min.js',
        ],
};
```

注意：

1. 如果要支持 IE10 或以下，external react 还需要额外引入补丁，比如 `https://gw.alipayobjects.com/os/lib/alipay/react16-map-set-polyfill/1.0.2/dist/react16-map-set-polyfill.min.js`
2. 如果 external antd，需同时 external 额外的 moment、react 和 react-dom，并在 antd 前引入

## 减少补丁尺寸

Umi 默认会包含以下浏览器及其版本的补丁，

```
chrome: 49,
firefox: 64,
safari: 10,
edge: 13,
ios: 10,
```

选择合适的浏览器版本，可减少不少尺寸，比如配成以下这样，预计可减少 90K （压缩后未 gzip）的尺寸。

```js
export default {
  targets: {
    chrome: 79,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
};
```

注意：

- 把浏览器设为 false 则不会包含他的补丁

## 调整 splitChunks 策略，减少整体尺寸

如果开了 dynamicImport，然后产物特别大，每个出口文件都包含了相同的依赖，比如 antd，可尝试通过 splitChunks 配置调整公共依赖的提取策略。

比如：

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
      },
    });
  },
};
```

## 通过 NODE_OPTIONS 设置内存上限

如果出现 OOM，也可以通过增加内存上限尝试解决。比如 `NODE_OPTIONS=--max_old_space_size=4096` 设置为 4G。

## 调整 SourceMap 生成方式

如果 dev 时慢或者修改代码后增量编译慢，可尝试禁用 SourceMap 生成或者调整为更低成本的生成方式，

```js
// 禁用 sourcemap
export default {
  devtool: false,
};
```

或者，

```js
// 使用最低成本的 sourcemap 生成方式，默认是 cheap-module-source-map
export default {
  devtool: 'eval',
};
```

## monaco-editor 编辑器打包

编辑器打包，建议使用如下配置，避免构建报错：

```js
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export default {
  chainWebpack: (memo) => {
    // 更多配置 https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    memo.plugin('monaco-editor-webpack-plugin').use(MonacoWebpackPlugin, [
      // 按需配置
      { languages: ['javascript'] },
    ]);
    return memo;
  },
};
```

## 替换压缩器为 esbuild

> 试验性功能，可能有坑，但效果拔群。

以依赖了全量 antd 和 bizcharts 的项目为例，在禁用 Babel 缓存和 Terser 缓存的基础上进行了测试，效果如图：

![](https://gw.alipayobjects.com/zos/antfincdn/NRwBU0Kgui/7f24657c-ec26-420b-b956-14ae4e3de0a3.png)

先安装依赖，

```bash
$ yarn add @umijs/plugin-esbuild
```

然后在配置里开启，

```js
export default {
  esbuild: {},
};
```

## 不压缩

> 不推荐，紧急情况下使用。

编译慢中压缩时间占了大部分，所以如果编译时不压缩可节约大量的时间和内存消耗，但尺寸会增加不少。通过环境变量 `COMPRESS=none` 可跳过压缩。

```bash
$ COMPRESS=none umi build
```
