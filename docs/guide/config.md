# 配置

## 配置文件

umi 允许在 `.umirc.js` 或 `config/config.js` （二选一）中进行配置，支持 ES6 语法。

比如：

```js
export default {
  pages: {
    '/index': { context: { title: 'IndexPage' } },
    '/list':  { context: { title: 'ListPage' } },
  },
  context: {
    title: 'Unnamed Page',
  },
  hd: true,
};
```

具体配置项详见[配置](/config/)。

## 扩展 webpack

::: danger
这不是推荐的使用方式，因为 umi 的后续升级有可能会和你的修改冲突。
:::

如果内置的 webpack 配置不满足需求，你可以在根目录新建 `webpack.config.js` 来扩展 webpack 配置。

比如：

```js
// 通过环境变量判断是给 dev 还是 build 用
const isDev = process.env.NODE_ENV === 'development';

export default function(webpackConfig) {
  // 做一些修改
  webpackConfig.externals = {};
  webpackConfig.plugins.push(/* Your Plugin */);
  
  // 返回新的 webpack 配置
  return webpackConfig;
}
```
