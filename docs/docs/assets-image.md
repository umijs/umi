---
translateHelp: true
---

# Use Image


## Use pictures in JS

Use require to refer to pictures with relative paths. Such as:

```js
export default () => <img src={require('./foo.png')} />
```

Support aliases, such as pointing to the src directory through `@`:

```js
export default () => <img src={require('@/foo.png')} />
```

## Use svg in JS

**Component introduction**

```js
import { ReactComponent as Logo } from './logo.svg'

function Analysis() {
  return <Logo width={90} height={120} />
}
```

**URL-style introduction**

```js
import logoSrc from './logo.svg'

function Analysis() {
  return <img src={logoSrc} alt="logo" />
}
```


## Use images in CSS

Reference by relative path.

such as,

```css
.logo {
  background: url(./foo.png);
}
```

CSS aliases are also supported in, but you need to prefix it with `~`，

```css
.logo {
  background: url(~@/foo.png);
}
```

note:

1. This is the rule of webpack, if you switch to other packaging tools, there may be changes
2. Same in less

## Picture path problem

There are two ways to use pictures in the project,

1. First upload the image to cdn, and then use the absolute path of the image in JS and CSS
2. Put the image in the project, and use it in JS and CSS through a relative path

The former will not cause any problems; in the latter, if the relative path of the image is referenced in JS, the path will be absolutely imported according to publicPath when publishing, so even if dynamicImport is not enabled, you need to pay attention to the correctness of publicPath.

## Base64 compile

When importing a picture through a relative path, if the picture is smaller than 10K, it will be compiled into Base64, otherwise it will be constructed as an independent picture file.

The 10K threshold can be modified through [inlineLimit configuration](../config#inlinelimit).

## Use CDN

TODO
