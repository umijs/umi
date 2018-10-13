# umi-plugin-polyfill

umijs 的兼容插件，目前主要是兼容到 ie9。内置了 react 在 ie 下所需要的 polyfill 和 [setprototypeof](https://github.com/umijs/umi/issues/413)。

## 使用

在 `.umirc.js` 里配置插件，

```js
export default {
  plugins: [
    'umi-plugin-polyfill',
  ],
};
```
