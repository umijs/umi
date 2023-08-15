import { Message } from 'umi';

# Physical Build Caching

When building production artifacts with `umi build`, Umi 4 does not configure physical caching for webpack 5 by default. This is due to the issue of when the physical cache of webpack becomes invalid, as it depends on the actual circumstances of the user's project. As a result, there is no universal solution.

Therefore, when you are unsure which dependencies might cause the project's physical cache to become invalid, it's easy to end up with build cache that doesn't expire, leading to outdated artifacts and greatly affecting development efficiency.

## Caching Scenarios

There are reasons why your project might need build caching, and we can roughly divide these scenarios into two categories: regular projects and projects within a Monorepo.

### Regular Projects

When building is relatively slow, how can you reuse the physical cache from the last build to speed up multiple builds?

#### Preferred Approach

In this case, the preferred optimization approach should be to consider using other faster modern transpilers, such as adjusting [`srcTranspiler`](../docs/api/config#srctranspiler) or [`cssMinifier`](../docs/api/config#cssminifier).

#### Issues in CI

Physical caching generally resides in `node_modules/.cache`, which means that if you're building in a CI environment, the build infrastructure must support restoring the previous cache files. If the build container doesn't support cache restoration, you won't benefit from this feature either.

#### Criteria for Selection

So, you should consider enabling physical caching only when:

1. **Multiple Builds**: There is indeed a need for multiple repeated builds.

2. **Cache Restoration Possible**: You're building locally or in CI with a way to restore the previous physical cache files.

3. **Long Build Time**: The project's build time is relatively long, and using other transpilers still doesn't speed up the process (or there's a strong requirement not to switch transpilers).

Once these conditions are met, you can consider enabling physical caching.

#### Configuration Method

```ts
// .umirc.ts

import { join } from 'path'
import { defineConfig } from 'umi'
import { createHash } from 'crypto'

export default defineConfig({
  chainWebpack(config, { env }) {
    if (env === 'production') {
      config.cache({
        type: 'filesystem',
        store: 'pack',
        // 🟡 If your project's environment variables are different in each CI build, please choose or exclude.
        version: createEnvironmentHash(process.env),
        buildDependencies: {
          config: [__filename],
          tsconfig: [join(__dirname, 'tsconfig.json')],
          packagejson: [join(__dirname, 'package.json')],
          umirc: [join(__dirname, '.umirc.ts')],
          // 🟡 Other configuration file paths that might affect the project and whose content changes would invalidate the cache
        },
      })
    }
  },
})

function createEnvironmentHash(env: Record<string, any>) {
  const hash = createHash('md5')
  hash.update(JSON.stringify(env))
  const result = hash.digest('hex')
  return result
}
```

Please pay special attention to:

1. Identify the files and dependencies in your project that can affect the project. Configure them as dependencies so that changes to them invalidate the cache.

2. Because `process.env` includes all Node.js environment variables, which can be numerous, if environment variables differ in each CI build, choose the ones needed or exclude those that change.

    ```ts
    // For example, selecting environment variables that could affect the project's content
    createEnvironmentHash({
      NODE_ENV: process.env.NODE_ENV
      // ...
    })
    ```

### Projects in a Monorepo

In a Monorepo, how do you cache pre-build dependencies of other subpackages? For example, when building `apps/project-umi`, you need to first build its dependent subpackage `libs/component`. However, if there are no code changes in `libs/component` the next time, how do you skip the build for this part of the pre-dependencies?

In this case, we recommend using [Turborepo](https://turbo.build/repo) for a Monorepo build solution. For specific usage instructions, please refer to the [official documentation](https://turbo.build/repo/docs) and [examples](https://github.com/vercel/turbo/tree/main/examples).

Note: If you're building in a CI environment, cache restoration is also necessary for turbo caching. You can use the [`--cache-dir`](https://turbo.build/repo/docs/reference/command-line-reference#--cache-dir) option to change the cache location.