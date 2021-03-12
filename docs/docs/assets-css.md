# Use CSS

> This document uses css as an example, the same applies to `.less` files.

## Global Styling

Umi recognizes `src/global.css` as global style, if the file exists, its styles will be applied to the files first.

As an example of global style:

```css
.ant-select-selection {
  max-height: 51px;
  overflow: auto;
}
```

## CSS Modules

Umi will automatically recognize the use of CSS Modules. When you use it as CSS Modules, it is CSS Modules.

For instance:

```js
// CSS Modules
import styles from './foo.css';

// Non-CSS Modules
import './foo.css';
```

## CSS Preprocessor

Umi has built-in support for less, and does not support sass and stylus, but if you need it, you can configure it through chainWebpack or umi plugin.

## CSS third party libraries

TODO: The use of aliases.
