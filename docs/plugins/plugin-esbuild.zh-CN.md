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

使用 [esbuild#target](https://esbuild.github.io/api/#target) 配置。

- Type: `string | string[]`
- Default: `'es2015'`

例如转成 ES5：

```js
export default {
  esbuild: {
    target: 'es5',
  },
};
```

## FAQ

### IE 出现解析模板字符串失败错误

请手动设置 esbuild: { target: 'es5' } 即可解决。
