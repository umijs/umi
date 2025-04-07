---
toc: content
order: 7
group:
  title: Blog
---

# 物理构建缓存

在 `umi build` 构建生产环境产物时，Umi 4 默认没有配置 webpack 5 的物理缓存，这是因为 webpack 的物理缓存失效时机问题，需要依赖用户项目的实际情况，所以没有很好的通用解决方案。

所以，当你不明确哪些依赖会让项目物理缓存失效时，很容易产生构建缓存不失效，导致产物是旧的问题，极大影响研发效率。

## 缓存场景

当你的项目需要构建缓存时，是有原因的，我们粗略把场景分成两类：普通项目、Monorepo 中的项目。

### 普通项目

构建比较慢，如何复用上次的物理缓存，做到多次构建提速？

#### 首选解决思路

此时首选的优化思路应该是：考虑使用其他更快的现代转译器，比如调整 [`srcTranspiler`](../docs/api/config#srctranspiler) 、[`cssMinifier`](../docs/api/config#cssminifier) 。

#### CI 中的问题

物理缓存一般存在于 `node_modules/.cache` ，这就意味着如果你在 CI 中构建，构建的基建必须要支持恢复上次的缓存文件，如果构建容器不支持恢复缓存，同样也无法享受好处。

#### 选择依据

所以，当你：

1. **多次构建**：确实有多次反复构建的需求。

2. **能恢复缓存**：在本地构建，或在 CI 有手段能恢复上次的物理缓存文件。

3. **时间长**：项目构建时间比较长、开启其他转译器仍无法提速（或有强诉求无法切换转译器）。

满足这些条件后，你才应该考虑开启物理缓存。

#### 配置方法

```ts
// .umirc.ts

import { join } from 'path';
import { defineConfig } from 'umi';
import { createHash } from 'crypto';

export default defineConfig({
  chainWebpack(config, { env }) {
    if (env === 'production') {
      config.cache({
        type: 'filesystem',
        store: 'pack',
        // 🟡 假如你的项目在 CI 中构建每次环境变量都不一样，请挑选或者排除
        version: createEnvironmentHash(process.env),
        buildDependencies: {
          config: [__filename],
          tsconfig: [join(__dirname, 'tsconfig.json')],
          packagejson: [join(__dirname, 'package.json')],
          umirc: [join(__dirname, '.umirc.ts')],
          // 🟡 其他可能会影响项目的配置文件路径，其内容变更会使缓存失效
        },
      });
    }
  },
});

function createEnvironmentHash(env: Record<string, any>) {
  const hash = createHash('md5');
  hash.update(JSON.stringify(env));
  const result = hash.digest('hex');
  return result;
}
```

请格外注意：

1. 你的项目有哪些文件、依赖会影响项目，配置他们作为依赖，变更时可以使得缓存失效。

2. 因为 `process.env` 包括了所有的 nodejs 环境变量，这非常多，如果环境变量在 CI 中每次构建都存在差异，请挑选所需的环境变量，或者排除掉会变化的。

   ```ts
   // 如挑选可能会影响项目内容的环境变量
   createEnvironmentHash({
     NODE_ENV: process.env.NODE_ENV,
     // ...
   });
   ```

### Monorepo 中的项目

在 monorepo 中，如何缓存需要前置构建的其他子包，比如构建 `apps/project-umi` 需要先构建好他依赖的子包 `libs/component` ，但是下次 `libs/component` 没有代码改动，如何跳过这部分前置依赖的构建？

此时推荐你使用 [Turborepo](https://turbo.build/repo) 来做 monorepo 构建方案，具体使用方法请参见 [官方文档](https://turbo.build/repo/docs) 和 [examples](https://github.com/vercel/turbo/tree/main/examples) 。

注：如果在 CI 中构建，同样需要容器支持恢复上次的 turbo 缓存，可以通过 [`--cache-dir`](https://turbo.build/repo/docs/reference/command-line-reference#--cache-dir) 选项更改缓存位置。
