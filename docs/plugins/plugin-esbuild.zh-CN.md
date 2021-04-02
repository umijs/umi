# @umijs/plugin-esbuild

> 试验性功能，可能有坑，但效果拔群。

使用 esbuild 作为压缩器。

## 启用方式

配置开启。

## 配置

比如：

```js
export default {
  esbuild: {},
};
```

### target

使用 [esbuild#target](https://esbuild.github.io/api/#target) 配置，例如转成 ES5：

```js
export default {
  esbuild: {
    target: 'es5',
  },
};
```

### pure

使用 [esbuild#pure](https://esbuild.github.io/api/#pure) 配置，例如移除 `console`:

```js
export default {
  esbuild: {
    pure: ['console.log', 'console.info'],
  },
};
```
