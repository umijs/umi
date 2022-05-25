# antd

整合 antd 组件库。

## 启用方式

配置开启，示例：

```ts
// config/config.ts
export default {
  antd: {
    // configProvider
    configProvider: {},
    // themes
    dark: true,
    compact: true,
    // babel-plugin-import
    import: true,
    // less or css, default less
    style: 'less',
  },
};
```

## 介绍

包含以下功能：

1. 内置 [antd](https://ant.design/)，目前内置版本是 `^4.0.0`
2. 基于 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) 做按需编译
3. 使用 antd@4 时，可一键切换为暗色主题，见下图

![](https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mYU9R4YFxscAAAAAAAAAAABkARQnAQ)

## 配置

### dark

开启暗色主题。

- Type: `boolean`
- Default: `false`

### compact

开启紧凑主题。

- Type: `boolean`
- Default: `false`

比如：

```ts
export default {
  antd: {
    dark: true,
    compact: true,
  },
};
```

启用暗色主题，只有 antd 使用版本 4 时才支持。紧凑主题在 `antd@>4.1.0` 时支持。

### import

- Type: `boolean`

配置 `antd` 的 `babel-plugin-import` 按需加载。

### style

- Type: `"less" | "css"`
- Default: `less`

配置使用 `antd` 的样式，默认 `less`。

### configProvider

- Type: `object`

配置 `antd` 的 `configProvider`。

## FAQ

### 如何使用 antd 的其他版本？

在项目中安装你需要的 antd 版本。
