# 配置

Umi 在 `.umirc.ts` 或 `config/config.ts` 中配置项目和插件，支持 es6。一份常见的配置如下，

```bash
export default {
  base: '/docs/',
  publicPath: '/static/',
  hash: true,
  history: {
    type: 'hash',
  },
}
```

## 配置文件

推荐在 `.umirc.ts` 中写配置。如果配置比较复杂需要拆分，可以放到 `config/config.ts` 中，并把配置的一部分拆出去，比如路由。

两者二选一，`.umirc.ts` 优先级更高。

## TypeScript 提示

如果你想在写配置时也有提示，可以通过 umi 的 `defineConfig` 方法定义配置，

```js
import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```

![](https://img.alicdn.com/tfs/TB1EV1pv.T1gK0jSZFhXXaAtVXa-1204-838.png)

## 本地临时配置

可以新建 `.umirc.local.ts`，这份配置会和 `.umirc.ts` 做 deep merge 后形成最终配置。

> 注：`.umirc.local.ts` 仅在 `umi dev` 时有效。`umi build` 时不会被加载。

比如，

```js
// .umirc.ts
export default { a: 1, b: 2 };

// .umirc.local.ts
export default { c: 'local' };
```

拿到的配置是：

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

注意：

* `config/config.ts` 对应的是 `config/config.local.ts`
* `.local.ts` 是本地验证使用的临时配置，请将其添加到 `.gitignore`，**务必不要提交到 git 仓库中**
* `.local.ts` 配置的优先级最高，比 `UMI_ENV` 指定的配置更高

## 多环境多份配置

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
