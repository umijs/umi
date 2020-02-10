# Umi 2 和 3 的插件接口变化

想到啥写啥，慢慢补充

- `api.applyPlugins` 变成异步执行，这应该是最大的 BREAK CHANGE
- 很多的方法的接口都有细微变化，基本思路是全部用 object 类型的单个参数，便于扩展，比如 `api.registerCommand({ name, alias, fn })` 和 `api.applyPlugins({ key, type, initialValue, args })`
- 现有的 API 方法和参数具体参考 [https://github.com/umijs/umi-next/blob/master/packages/types/index.d.ts](https://github.com/umijs/umi-next/blob/master/packages/types/index.d.ts)
- utils 方法全部来自 [@umijs/utils](https://github.com/umijs/umi-next/blob/master/packages/utils/src/index.ts)，同类功能的方法不允许使用其他的，比如请求用 got，参数处理用 yargs
- utils 有两种使用方式，`api.utils` 和 `import { utils } from 'umi'`，后者在组织代码时，可以不需把 api 或 api.utils 里往下传
- `api.paths` 和 `api.config` 在注册阶段不再能被取到，只在执行阶段能被取到，如果要在注册阶段使用用户配置，可以先用 `api.service.userConfig`
- `api.log` 变成 `api.logger.(log|info|debug|error|warn|profile)`

更多变更，参考 [https://github.com/umijs/umi-next/blob/master/docs/packages/core.md](https://github.com/umijs/umi-next/blob/master/docs/packages/core.md)
