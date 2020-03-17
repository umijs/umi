# Use Image


## Using images in JS

Refer to the relative path image via require.

such as:

```js
export default () => <img src={require('./foo.png')} />
```

Alias ​​support, such as pointing to the src directory via `@`:

```js
export default () => <img src={require('@/foo.png')} />
```

## Using images in CSS

Referenced by relative path.

such as,

```css
.logo {
  background: url(./foo.png);
}
```

CSS also supports aliases, but you need to prefix them with `~`.

```css
.logo {
  background: url(~@/foo.png);
}
```

note:

1. This is the rule of webpack, if you switch to other packaging tools, it may change
2. The same applies in less

## Picture path problem

There are two ways to use pictures in your project.

1. First pass the image to cdn, then use the absolute path of the image in JS and CSS
2. Put the picture in the project and use it in JS and CSS by relative path

The former will not have any problems; the latter, if you refer to a relative path picture in JS, the path will be absolutely introduced according to publicPath when publishing, so you need to pay attention to the correctness of publicPath even if dynamicImport is not enabled.

## Base64 compilation

When importing a picture through a relative path, if the picture is less than 10K, it will be compiled into Base64, otherwise it will be constructed as a separate picture file.

The 10K threshold can be modified by [inlineLimit Configuration](../config#inlinelimit).

## Use CDN

TODO
