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

## 改动点

- @umijs/babel-preset-umi 定位变更，之前是只适用于项目，变更为一个通用的 **babel 插件中心**
- 各功能通过配置开启，然后在 umi 插件中可更改配置，达到用户无需手动处理常用 babel 插件的目的
- 提供场景封装，比如项目、测试、node 和 browser 场景的组件打包等

## TODO

- 通过配置项锁定项目的 core-js 版本，通过 babel 插件
- 考虑 babel-plugin-macros 的应用场景
- 集成 [@babel/preset-modules](https://github.com/babel/preset-modules)
- 集成 umi ui 的 flag babel 插件
