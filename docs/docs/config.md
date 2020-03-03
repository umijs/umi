---
translateHelp: true
---

# Config

Umi in `.umirc.ts` or `config/config.ts` configuration items and plug-in support es6. A common configuration is as follows

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

## Configuration file

Recommended `.umirc.ts` write configuration. If the configuration requires more complicated split, it can be placed in `config/config.ts` and removed out of the part of the configuration, such as routing.

Choose one of the two, with `.umirc.ts` taking higher priority.

## TypeScript tips

If you want to write the configuration also has tips that can umi by `defineConfig` definition method configuration

```js
import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```

![](https://img.alicdn.com/tfs/TB1EV1pv.T1gK0jSZFhXXaAtVXa-1204-838.png)

## Local temporary configuration

You can create `.umirc.local.ts` and the configuration file `.umirc.ts` will form the final configuration after doing deep merge.

Example:

```js
// .umirc.ts
export default { a: 1, b: 2 };

// .umirc.local.ts
export default { c: 'local' };
```

The configuration will be:

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

Note：

* `config/config.ts` sorresponds to `config/config.local.ts`
* `.local.ts` is a temporary configuration used for local authentication. Please add it to it `.gitignore` and **do not submit it to the git repository**
* `.local.tsConfiguration` has higher priority than `UMI_ENV` environment variable config

## Multiple environments and multiple configurations

Environmental variables can `UMI_ENV` distinguish different environments to specify configuration.

Example:

```js
// .umirc.js
export default { a: 1, b: 2 };

// .umirc.cloud.js
export default { b: 'cloud', c: 'cloud' };

// .umirc.local.js
export default { c: 'local' };
```

If `UMI_ENV` is not defined, the configuration is:

```js
{
  a: 1,
  b: 2,
  c: 'local',
}
```

If `UMI_ENV=cloud`, the configuration is:

```js
{
  a: 1,
  b: 'cloud',
  c: 'local',
}
```
