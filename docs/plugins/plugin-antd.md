---
translateHelp: true
---

# @umijs/plugin-antd

整合 antd 组件库。

## 启用方式

配置开启。

## 介绍

包含以下功能，

1. 内置 [antd](https://ant.design/)，目前内置版本是 `^4.0.0`
2. 内置 [antd-mobile](https://mobile.ant.design/)，目前内置版本是 `^2.3.1`
3. 基于 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) 做按需编译
4. 使用 antd@4 时，可一键切换为暗色主题，见下图

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

```js
export default {
  antd: {
    dark: true,
    compact: true,
  },
};
```

启用暗色主题，只有 antd 使用版本 4 时才支持。紧凑主题在 `antd@>4.1.0` 时支持。

### config

使用 antd 的全局化配置。

- Type: `object`
- Default: `{}`

支持 [ConfigProvider](https://ant.design/components/config-provider-cn/) 的配置。

比如：

```js
export default {
  antd: {
    config: {
      componentSize: 'small',
    },
  },
};
```

#### 运行时配置

##### antd

- Type: `object`

```typescript
// src/app.ts
export const antd = {
  componentSize: 'small',
};
```

## FAQ

### 如何使用 antd 的其他版本？

在项目中显式安装 antd 依赖。

### 没有 TypeScript 提示怎么办？

在项目中安装 antd 依赖。
