# Using Images

## Using Images in JavaScript

You can reference images with relative paths using `require` in JavaScript. For example:

```js
export default () => <img src={require('./foo.png')} />
```

Aliases are also supported, such as using `@` to point to the `src` directory:

```js
export default () => <img src={require('@/foo.png')} />
```

## Using SVGs in JavaScript

**Component-Based Import**

```js
import { ReactComponent as Logo } from './logo.svg'

function Analysis() {
  return <Logo width={90} height={120} />
}
```

**URL-Based Import**

```js
import logoSrc from './logo.svg'

function Analysis() {
  return <img src={logoSrc} alt="logo" />
}
```

## Using Images in CSS

You can reference images with relative paths in CSS. For example:

```css
.logo {
  background: url(./foo.png);
}
```

Aliases are also supported in CSS, but you need to prefix them with `~`. For example:

```css
.logo {
  background: url(~@/foo.png);
}
```

Please note:

1. These rules are specific to Webpack. If you switch to another bundling tool, there may be differences.
2. The same rules apply to Less as well.

## Image Path Considerations

There are two ways to use images in your project:

1. Upload the images to a CDN and then use absolute paths to reference them in your JS and CSS.
2. Place the images in your project and use relative paths in your JS and CSS.

The first approach should work without any issues. For the second approach, when referencing images with relative paths in JavaScript, they will be included with absolute paths in the build based on the `publicPath`. So, even if you haven't enabled `dynamicImport`, ensure that the `publicPath` is configured correctly.

## Base64 Encoding

When importing images with relative paths, images smaller than 10KB will be encoded as Base64. Otherwise, they will be built as separate image files.

You can modify the 10KB threshold using the [inlineLimit configuration](../config#inlinelimit).

## Using CDN

TODO
