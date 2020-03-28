# Use CSS


> This document uses css as an example. Changing the suffix to `.less` also works.

## Global style

By umi convention `src/global.css` is a global style. If this file exists, it will be automatically introduced to the front of the entry file.

Such as for overlay styles,

```css
.ant-select-selection {
  max-height: 51px;
  overflow: auto;
}
```

## CSS Modules

Umi will automatically recognize the use of CSS Modules. You can only use CSS Modules when you import as CSS Modules.

such as:

```js
// with CSS Modules
import styles from './foo.css';

// without CSS Modules
import './foo.css';
```

## CSS preprocessor

Umi has built-in support for less, but not sass or stylus. If there is a need, It can be supported through chainWebpack configuration or umi plugin.

## Third party library introduced in CSS

TODO: the use of aliases.
