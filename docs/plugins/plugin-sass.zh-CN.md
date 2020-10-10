# @umijs/plugin-sass

启用 sass 编译支持。

## 启用方式

默认开启。

## 配置

### implementation

默认是 [Dart Sass](https://sass-lang.com/dart-sass)。

如果要切换到 [Node Sass](https://github.com/sass/node-sass)，可安装 `node-sass` 依赖，然后配置，

```js
export default {
  sass: {
    implementation: require('node-sass'),
  },
}
```

### sassOptions

* Type: `Object|Function`

传递给 [Dart Sass](https://github.com/sass/dart-sass#javascript-api) 或 [Node Sass](https://github.com/sass/node-sass/#options) 的配置项。
