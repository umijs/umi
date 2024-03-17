---
order: 3
toc: content
translated_at: '2024-03-17T09:48:51.045Z'
---

# antd

Integration of the antd component library.

## How to Enable

Configure to enable, example:

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
    // used to configure theme token, antd v5 only
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

## Introduction

Includes the following features:

1. Built-in [antd](https://ant.design/), the current built-in version is `^4.0.0`
2. On-demand compilation based on [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)
3. When using antd@4, you can switch to the dark theme with one click, see the image below

![](https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mYU9R4YFxscAAAAAAAAAAABkARQnAQ)

## Configuration

### Build-time Configuration

Note: Build-time configuration will go through JSON conversion, so here you can only set configurations that conform to the JSON format. For function configurations like `algorithm`, set them at [Runtime Configuration](#runtime-configuration).

#### dark

Enables dark theme.

- Type: `boolean`
- Default: `false`

#### compact

Enables compact theme.

- Type: `boolean`
- Default: `false`

For example:

```ts
export default {
  antd: {
    dark: true,
    compact: true,
  },
};
```

Dark theme activation is only supported with antd version 4. Compact theme is supported with `antd@>4.1.0`.

#### import

- Type: `boolean`

Configure `antd`'s `babel-plugin-import` for on-demand loading.

#### style

- Type: `"less" | "css"`
- Default: `less`

Configure the use of `antd` styles, default is `less`.

#### configProvider

- Type: `object`

Configure `antd`'s `configProvider`.

#### theme

- Type: `object`

Configure theme token for `antd@5`, equivalent to setting `configProvider.theme`, and this configuration item has higher priority.

**Note: This configuration is only available for antd v5**

#### appConfig

- Type: `object`

Configure the App wrapper component for `antd`, please note that for `antd@5.1.0 ~ 5.2.3`, it can only be enabled through `appConfig: {}`, and only `antd >=5.3.0` supports more App configuration projects.

**Note: This configuration is only available for antd v5.1.0 and above**

#### momentPicker

- Type: `boolean`

Configure whether `antd`'s `DatePicker`, `TimePicker`, `Calendar` components use `moment` as the date processing library, default is `false`.

**Note: This configuration is only available for antd v5 and above**

#### styleProvider

- Type: `object`

Configure `antd`'s `StyleProvider` component, which is used to support legacy browsers, such as IE11. When your project is configured with `legacy` or `targets` that include `ie`, it will automatically be downgraded, no manual configuration required.

**Note:**

1. This configuration is only available for antd v5 and above.

2. The downgrade of CSS relies on [`@ant-design/cssinjs`](https://ant.design/docs/react/compatible-style-cn). If you have explicitly installed `antd`, please also install and ensure that your `@ant-design/cssinjs` version corresponds correctly with `antd`.

### Runtime Configuration

In the runtime configuration of `app.ts(x)`, you can modify the values of antd's `ConfigProvider`. Before using this feature, **make sure you have enabled the `antd.configProvider` option**, otherwise changes to `ConfigProvider` will not take effect:

```ts
// .umirc.ts

  antd: {
    configProvider: {}
  }
```

For example, to configure antd 5's theme preset algorithm and the maximum number of `message` notifications:

```ts
// app.ts
import { RuntimeAntdConfig } from 'umi';
import { theme } from 'antd';

export const antd: RuntimeAntdConfig = (memo) => {
  memo.theme ??= {};
  memo.theme.algorithm = theme.darkAlgorithm; // Configure the preset dark algorithm for antd5

  memo.appConfig = {
    message: {
      // Configure the maximum number of messages displayed, when exceeding the limit, the earliest messages will be automatically closed
      maxCount: 3,
    }
  }

  return memo;
};
```

### Dynamically Switch Global Configuration

**Note: This feature is only available for antd v5**

Use `useAntdConfig` / `useAntdConfigSetter` methods to dynamically get and modify antd's `ConfigProvider` configuration, which can typically be used to dynamically modify themes.

Note: This feature depends on `ConfigProvider`, please also enable `configProvider: {}`.

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
            // This configuration will deep merge with the original configuration
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

Using `setAntdConfig`, you can dynamically modify any property supported by [antd@5 ConfigProvider](https://ant.design/components/config-provider-cn).

## FAQ

### How to use other versions of antd?

Install the version of antd you need in your project.
