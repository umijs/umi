---
translateHelp: true
---

# @umijs/plugin-antd


Integrate antd component library.

## How to enable

Configuration is on.

## Introduction

Contains the following features,

1. Built-in [antd](https://ant.design/), the current built-in version is `^ 4.0.0`
2. Built-in [antd-mobile](https://mobile.ant.design/), the current built-in version is `^2.3.1`
2. Compile on demand based on [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)
3. When using antd@4, you can switch to dark theme with one click, as shown below

![](https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mYU9R4YFxscAAAAAAAAAAABkARQnAQ)

## Configuration

### dark

* Type: `boolean`
* Default: `false`

such as:

```js
export default {
  antd: {
    dark: true,
  },
}
```

Enable dark theme, only supported by antd with version 4.

## FAQ

### How do I use other versions of antd?

Explicitly install antd dependencies in your project.

### What if I don't have a TypeScript prompt?

Install antd dependencies in your project.
