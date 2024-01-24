---
order: 3
toc: content
---
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
    // shortcut of `configProvider.theme`
    // use to configure theme token, antd v5 only
    theme: {},
    // antd <App /> valid for version 5.1.0 or higher, default: undefined
    appConfig: {},
    // Transform DayJS to MomentJS
    momentPicker: true,
    // Add StyleProvider for legacy browsers
    styleProvider: {
      hashPriority: 'high',
      legacyTransformer: true,
    },
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

### 构建时配置

注意：构建时配置会经过 json 转换，所以这里只能进行符合 json 格式的配置，如有例如 algorithm 等函数配置，可在[运行时配置](#运行时配置)中进行设置。

#### dark

开启暗色主题。

- Type: `boolean`
- Default: `false`

#### compact

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

#### import

- Type: `boolean`

配置 `antd` 的 `babel-plugin-import` 按需加载。

#### style

- Type: `"less" | "css"`
- Default: `less`

配置使用 `antd` 的样式，默认 `less`。

#### configProvider

- Type: `object`

配置 `antd` 的 `configProvider`。

#### theme

- Type: `object`

配置 `antd@5` 的 theme token，等同于配置 `configProvider.theme`，且该配置项拥有更高的优先级。

**注意：该配置项仅 antd v5 可用**

#### appConfig

- Type: `object`

配置 `antd` 的 App 包裹组件，请注意 `antd@5.1.0 ~ 5.2.3` 仅能通过 `appConfig: {}` 启用，只有 `antd >=5.3.0` 才支持更多 App 配置项目。

**注意：该配置项仅 antd v5.1.0 及以上可用**

#### momentPicker

- Type: `boolean`

配置 `antd` 的 `DatePicker`、`TimePicker`、`Calendar` 组件是否使用 `moment` 作为日期处理库，默认为 `false`。

**注意：该配置项仅 antd v5 及以上可用**

#### styleProvider

- Type: `object`

配置 `antd` 的 `StyleProvider` 组件，该组件用于兼容低版本浏览器，如 IE11。当你的项目配置了 `legacy` 或者 `targets` 包含 `ie` 时，会自动进行降级处理，不需要手动配置。

**注意：**

1. 该配置项仅 antd v5 及以上可用。

2. 降级 CSS 需要依赖 [`@ant-design/cssinjs`](https://ant.design/docs/react/compatible-style-cn) ，若你显示安装了 `antd` ，请安装并确保你的 `@ant-design/cssinjs` 版本与 `antd` 正确对应。

### 运行时配置

在 app.ts(x) 文件中可以对 antd 进行更丰富的配置，比如配置 antd5 的预设算法和 message 最大显示数：

```ts
// app.ts
import { RuntimeAntdConfig } from 'umi';
import { theme } from 'antd';

export const antd: RuntimeAntdConfig = (memo) => {
  memo.theme ??= {};
  memo.theme.algorithm = theme.darkAlgorithm; // 配置 antd5 的预设 dark 算法

  memo.appConfig = {
    message: {
      // 配置 message 最大显示数，超过限制时，最早的消息会被自动关闭
      maxCount: 3,
    }
  }

  return memo;
};
```

### 动态切换全局配置

**注意：该功能仅 antd v5 可用**

通过 `useAntdConfig` / `useAntdConfigSetter` 方法来动态获取、修改 antd 的 `ConfigProvider` 配置，通常可用于动态修改主题。

注：此功能需依赖 `ConfigProvider` ，请一并开启 `configProvider: {}` 。

```tsx
import { Layout, Space, Button, version, theme, MappingAlgorithm } from 'antd';
import { useAntdConfig, useAntdConfigSetter } from 'umi';
const { darkAlgorithm, defaultAlgorithm } = theme;

export default function Page() {
  const setAntdConfig = useAntdConfigSetter();
  const antdConfig = useAntdConfig();
  return (
    <Layout>
      <h1>with antd@{version}</h1>
      <Space>
        isDarkTheme
        <Switch
          checked={antdConfig?.theme?.algorithm.includes(darkAlgorithm)}
          onChange={(data) => {
            // 此配置会与原配置深合并
            setAntdConfig({
              theme: {
                algorithm: [
                  data ? darkAlgorithm : defaultAlgorithm,
                ],
              },
            });
            // or 
            setAntdConfig((config) => {
              const algorithm = config.theme!.algorithm as MappingAlgorithm[];
              if (algorithm.includes(darkAlgorithm)) {
                config.theme!.algorithm = [defaultAlgorithm]
              } else {
                config.theme!.algorithm = [darkAlgorithm];
              }
              return config;
            });
          }}
        ></Switch>
      </Space>
    </Layout>
  );
}
```

使用 `setAntdConfig` 可以动态修改 [antd@5 ConfigProvider](https://ant.design/components/config-provider-cn) 组件支持的所有属性。

## FAQ

### 如何使用 antd 的其他版本？

在项目中安装你需要的 antd 版本。
