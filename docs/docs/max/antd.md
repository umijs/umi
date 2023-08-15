# Ant Design (antd)

Integrating the antd component library.

## Activation Method

Enable through configuration, for example:

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

## Introduction

Includes the following features:

1. Built-in [antd](https://ant.design/), currently built-in version is `^4.0.0`
2. Uses [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) for on-demand compilation
3. When using antd@4, you can switch to dark theme with a single click, as shown in the image below

![](https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mYU9R4YFxscAAAAAAAAAAABkARQnAQ)

## Configuration

### Build-time Configuration

Note: Build-time configuration goes through JSON conversion, so only configurations that conform to JSON format can be performed here. If there are function configurations such as `algorithm`, they can be set in the [runtime configuration](#runtime-configuration).

#### dark

Enable dark theme.

- Type: `boolean`
- Default: `false`

#### compact

Enable compact theme.

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

Dark theme is only supported when antd is used in version 4. Compact theme is supported in `antd@>4.1.0`.

#### import

- Type: `boolean`

Configure `babel-plugin-import` for on-demand loading of `antd`.

#### style

- Type: `"less" | "css"`
- Default: `less`

Configure whether to use the styles of `antd`, default is `less`.

#### configProvider

- Type: `object`

Configure the `configProvider` of `antd`.

#### theme

- Type: `object`

Configure theme tokens for `antd@5`, equivalent to configuring `configProvider.theme`, and this configuration has a higher priority.

**Note: This configuration is only available for antd v5**

#### appConfig

- Type: `object`

Configure the App wrapper component of `antd`, please note that only `appConfig: {}` can be used to enable `antd@5.1.0 ~ 5.2.3`, and only `antd >=5.3.0` supports more App configuration items.

**Note: This configuration is only available for antd v5.1.0 and above**

#### momentPicker

- Type: `boolean`

Configure whether the `DatePicker`, `TimePicker`, and `Calendar` components of `antd` should use `moment` as the date processing library, default is `false`.

**Note: This configuration is only available for antd v5 and above**

#### styleProvider

- Type: `object`

Configure the `StyleProvider` component of `antd`, this component is used to be compatible with older browsers like IE11. When your project is configured with `legacy` or `targets` includes `ie`, it will automatically degrade, and manual configuration is not needed.

**Note: This configuration is only available for antd v5 and above**

### Runtime Configuration

In the `app.ts(x)` file, you can have more extensive configuration for antd, such as configuring antd5's preset algorithms and the maximum display count of messages:

```ts
// app.ts
import { RuntimeAntdConfig } from 'umi';
import { theme } from 'antd';

export const antd: RuntimeAntdConfig = (memo) => {
  memo.theme ??= {};
  memo.theme.algorithm = theme.darkAlgorithm; // Configure antd5's preset dark algorithm

  memo.appConfig = {
    message: {
      // Configure the maximum display count of messages, and the earliest message will be automatically closed when it exceeds the limit
      maxCount: 3,
    }
  }

  return memo;
};
```

## FAQ

### How to use other versions of antd?

Install the antd version you need in your project.


```shell
# Install the desired version of antd
$ npm install antd@version
```

Then specify the version of antd you want to use in the configuration:

```ts
// config/config.ts
export default {
  antd: {
    version: '4.16.0', // or any other version you installed
  },
};
```
