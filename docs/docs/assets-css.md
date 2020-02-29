---
translateHelp: true
---

# Use CSS


> 本文档以 css 为示例，把后缀换成 `.less` 同样适用。

## 全局样式

Umi 中约定 `src/global.css` 为全局样式，如果存在此文件，会被自动引入到入口文件最前面。

比如用于覆盖样式，

```css
.ant-select-selection {
  max-height: 51px;
  overflow: auto;
}
```

## CSS Modules

Umi 会自动识别 CSS Modules 的使用，你把他当做 CSS Modules 用时才是 CSS Modules。

比如：

```js
// CSS Modules
import styles from './foo.css';

// 非 CSS Modules
import './foo.css';
```

## CSS 预处理器

Umi 内置支持 less，不支持 sass 和 stylus，但如果有需求，可以通过 chainWebpack 配置或者 umi 插件的形式支持。

## CSS 中引入三方库

TODO：别名的使用。
