---
translateHelp: true
---

# @umijs/plugin-antd


Integrate antd component library.

## How to enable

The configuration is turned on.

## Introduction

Contains the following functions,

1. Built-in [antd](https://ant.design/), the current built-in version is `^4.0.0`
2. Built-in [antd-mobile](https://mobile.ant.design/), the current built-in version is `^2.3.1`
3. Compile on demand based on [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)
4. When using antd@4, you can switch to the dark theme with one click, see the picture below

![](https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mYU9R4YFxscAAAAAAAAAAABkARQnAQ)

## Configuration

### dark

Turn on dark theme.

* Type: `boolean`
* Default: `false`

### compact

Open compact theme.

* Type: `boolean`
* Default: `false`

such as:

```js
export default {
  antd: {
    dark: true,
    compact: true,
  },
}
```

Enable dark theme, only supported when antd uses version 4. Compact themes are supported when ʻantd@>4.1.0`.

### config

Use antd's global configuration.

* Type: `object`
* Default: `{}`

Support the configuration of [ConfigProvider](https://ant.design/components/config-provider-cn/).

such as:

```js
export default {
  antd: {
    config:{
        componentSize:'small'
    }
  },
}
```

### Runtime configuration

##### antd

* Type: `object`

```typescript
// src/app.ts
export const antd = {
  componentSize:'small'
}
```

## FAQ

### How to use other versions of antd?

Explicitly install antd dependencies in the project.

### What if there is no TypeScript prompt?

Install antd dependencies in the project.
