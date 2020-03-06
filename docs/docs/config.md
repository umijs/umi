# Config

Configuring with es6 syntax is supported in `.umirc.ts` or `config/config.ts`. A common configuration looks as below:

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

## Configuration

We recommend configuring your app with `.umirc.ts`. It is possible to split your configurations into pieces and organize them in `config/config.ts` if your app requires complicated configuration. For example, if you need to configure routers, it would be a good choice to have it in an individual module alongside `config/config.ts`.

You have to choose between `.umirc.ts` and `config/config.ts`, `.umirc.ts` has higher priority.

## TypeScript IntelliSense

If you used to working with IntelliSense even when writing configuration, import `defineConfig` from 'umi' helps.

```js
import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```

![](https://img.alicdn.com/tfs/TB1EV1pv.T1gK0jSZFhXXaAtVXa-1204-838.png)

## local configuration

Create `.umirc.local.ts`, it will be deep merged with `.umirc.ts` while using `umi dev`.

For example:

```js
// .umirc.ts
export default { a: 1, b: 2 };

// .umirc.local.ts
export default { c: 'local' };
```

The final configuration shall be:

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

Notice：

* local configuration file of `config/config.ts` is `config/config.local.ts`
* `.local.ts` should only be used for local debugging，**Don't commit it to git repo**
* `.local.ts` has higher priority compare with others specified with `UMI_ENV`

## Configuration for multiple environments

Environment variable `UMI_ENV` shall be used to identify configurations for different environemtns.

For example:

```js
// .umirc.js
export default { a: 1, b: 2 };

// .umirc.cloud.js
export default { b: 'cloud', c: 'cloud' };

// .umirc.local.js
export default { c: 'local' };
```

If we don't specify `UMI_ENV` , the final configuration we get will be:

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

If `UMI_ENV=cloud` is specified, the final configuration we get will be:

```js
{
  a: 1,
  b: 'cloud',
  c: 'local',
}
```
