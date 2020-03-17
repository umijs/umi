# @umijs/plugin-sass


Enable sass compilation support.

## How to enable

On by default.

## Configuration

### implementation

The default is [Dart Sass](https://sass-lang.com/dart-sass).

If you want to switch to [Node Sass](https://github.com/sass/node-sass), you can install the `node-sass` dependency and configure it.

```js
export default {
  sass: {
    implementation: require('node-sass'),
  },
}
```

### sassOptions

* Type: `Object|Function`

Configuration passed to [Dart Sass](https://github.com/sass/dart-sass#javascript-api) or [Node Sass](https://github.com/sass/node-sass/#options) item.
