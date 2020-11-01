---
translateHelp: true
---

# Use CSS


> This document uses css as an example, and changing the suffix to `.less` also applies.

## Global style

Umi In the convention, `src/global.css` is a global style. If this file exists, it will be automatically imported to the front of the entry file.

For example, to override the style，

```css
.ant-select-selection {
  max-height: 51px;
  overflow: auto;
}
```

## CSS Modules

Umi will automatically recognize the use of CSS Modules. When you use it as CSS Modules, it is CSS Modules.

such as:

```js
// CSS Modules
import styles from './foo.css';

// non-CSS Modules
import './foo.css';
```

## CSS preprocessor

Umi has built-in support for less, and does not support sass and stylus, but if required, it can be supported through chainWebpack configuration or umi plugin.

## Introducing third party library in CSS

TODO: The use of aliases.
