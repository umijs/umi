# @umijs/bundler

## Notes

1. 用户不关心背后是 webpack、parcel、rollup 或者其他的
2. 插件可以提供能力扩展
3. 考虑多构建示例的场景，比如 ssr、modern mode 和 dll

## Usage

简单配置，

```js
export default {
  outputPath: './www',
  extraBabelPlugins: [],
};
```

切换构建工具为 parcel，

```js
export default {
  plugins: ['@umijs/plugin-parcel'],
  outputPath: './www',
  extraBabelPlugins: [],
};
```

## 插件层

修改底层的 webpack、parcel 等配置，通过 bundler 来区分是哪种 bundler。

```js
api.modifyBundleConfig(config, { env, bundler, type });
api.modifyBundleConfigs(config, { env, bundler, getConfig });
```

webpack 额外提供 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 的方式，

```js
api.chainWebpack(config, { type, env, bundler });
```

## 提供新的 bundler

比如新增 rollup 的，

```js
api.modifyBundler(() => {
  return require('@umijs/bundler-rollup').Bundler;
});
```
