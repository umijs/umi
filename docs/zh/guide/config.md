# 配置

## 配置文件

umi 允许在 `.umirc.js` 或 `config/config.js` （二选一，`.umirc.js` 优先）中进行配置，支持 ES6 语法。

> 为简化说明，后续文档里只会出现 `.umirc.js`。

比如：

```js
export default {
  base: '/admin/',
  publicPath: 'http://cdn.com/foo',
  plugins: [
    ['umi-plugin-react', {
      dva: true,
    }],
  ],
};
```

具体配置项详见[配置](/zh/config/)。

## .umirc.local.js

`.umirc.local.js` 是本地的配置文件，**不要提交到 git**，所以通常需要配置到 `.gitignore`。如果存在，会和 `.umirc.js` 合并后再返回。

## UMI_ENV

可以通过环境变量 `UMI_ENV` 区分不同环境来指定配置。

举个例子，

```js
// .umirc.js
export default { a: 1, b: 2 };

// .umirc.cloud.js
export default { b: 'cloud', c: 'cloud' };

// .umirc.local.js
export default { c: 'local' };
```

不指定 `UMI_ENV` 时，拿到的配置是：

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

指定 `UMI_ENV=cloud` 时，拿到的配置是：

```js
{
  a: 1,
  b: 'cloud',
  c: 'local',
}
```
