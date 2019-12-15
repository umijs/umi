# @umijs/babel-preset-umi

## Break Changes

- 需从 `babel-preset-umi` 切换为 `@umijs/babel-preset-umi/app`
- babel 升级到 7.7
- core-js 升级到 3
- 删除了 babel-plugin-macros，暂时没加，后面可能加

## Usage

可以直接用通用的 `@umijs/babel-preset-umi` 加配置，

```js
module.exports = {
  presets: [['@umijs/babel-preset-umi', opts]],
};
```

也可以使用封装好的版本，

- `@umijs/babel-preset-umi/app`，适用于项目开发
- `@umijs/babel-preset-umi/test`，适用于测试

## TODO

- 考虑 babel-plugin-macros 的应用场景
- 通过配置项使用 [@babel/preset-modules](https://github.com/babel/preset-modules)
- 通过配置项锁定 core-js 版本
