---
translateHelp: true
---

# Use Image


## JS 里使用图片

通过 require 引用相对路径的图片。

比如：

```js
export default () => <img src={require('./foo.png')} />
```

支持别名，比如通过 `@` 指向 src 目录：

```js
export default () => <img src={require('@/foo.png')} />
```

## CSS 里使用图片

通过相对路径引用。

比如，

```css
.logo {
  background: url(./foo.png);
}
```

CSS 里也支持别名，但需要在前面加 `~` 前缀，

```css
.logo {
  background: url(~@/foo.png);
}
```

注意：

1. 这是 webpack 的规则，如果切到其他打包工具，可能会有变化
2. less 中同样适用

## 图片路径问题

项目中使用图片有两种方式，

1. 先把图片传到 cdn，然后在 JS 和 CSS 中使用图片的绝对路径
2. 把图片放在项目里，然后在 JS 和 CSS 中通过相对路径的方式使用

前者不会有任何问题；后者，如果在 JS 中引用相对路径的图片时，在发布时会根据 publicPath 绝对引入路径，所以就算没有开启 dynamicImport 时，也需要注意 publicPath 的正确性。

## Base64 编译

通过相对路径引入图片的时候，如果图片小于 10K，会被编译为 Base64，否则会被构建为独立的图片文件。

10K 这个阈值可以通过 [inlineLimit 配置](TODO)修改。

## 使用 CDN

TODO
