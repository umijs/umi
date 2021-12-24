# @umijs/test

提供配置接口，轻松集成测试框架，支持组件库测试，框架工具测试和 umi 项目测试。

## 方法与配置

### createJestConfig

```ts
import { createJestConfig } from '@umijs/test'

const config = createJestConfig(UmiTestJestConfig, UmiTestJestOptions);
export default config;
```
#### UmiTestJestConfig

UmiTestJestConfig 就是 jest 的所有配置。

#### UmiTestJestOptions

```
export interface UmiTestJestOptions {
  hasE2e?: boolean;
  useEsbuild?: boolean;
}
```
| 属性 | 类型 | 说明 | 默认值 |
|  :-  | :-:  | :-:  | :-:  |
| hasE2e | boolean | 是否包含 e2e 测试 | true |
| useEsbuild | boolean | 是否使用 esbuild | false |

## jest 的安装与使用

```base
// jest 版本需要是 27
yarn add jest @umijs/test --dev
```

新建 `jest.config.ts` 

```ts
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import { createJestConfig } from '@umijs/test'

const config = createJestConfig({
}, { useEsbuild: false, });
// useEsbuild: true 会快3倍左右，但是不完全检测类型，所以在类型全部正确的情况下，可默认开启
export default config;
```

配置支持所有 jest 的配置，配置有两种写法，直接配置和传递修改函数

```ts
import { createJestConfig } from '@umijs/test'

const config = createJestConfig({
  collectCoverageFrom(memo = []) {
    return memo.concat(['!**/assets/*','!**/tests/demos/*'])
  },
  moduleDirectories: ['node_modules', 'src/tests'],
}, {});

export default config;
```

如上面的配置，collectCoverageFrom 会在默认的基础上扩展，而 moduleDirectories 将会直接覆盖。

```ts
{
  collectCoverageFrom:[
    '!**/.umi/**',
    '!**/.umi-production/**',
    '!**/typings/**',
    '!**/types/**',
    '!**/fixtures/**',
    '!**/examples/**',
    '!**/*.d.ts',
    '!**/assets/*','!**/tests/demos/*'
  ],
  moduleDirectories: ['node_modules', 'src/tests'],
}
```

## FAQ

### TypeError: Jest: a transform must export a `process` function.

更新 jest 到 jest@27

### createScriptTransformer is not defined

使用 jest@27 但存在 jest@26 相关的依赖

### Cannot read property 'cwd' of undefined

使用 jest@27 但存在 jest@26 相关的依赖
### 从 jest@26 升级到 jest@27

```diff
- "jest": "26.6.3",
- "jest-environment-jsdom": "26.6.2",
+ "jest": "^27.1.0",
```

> 'global is not defined': Please update jest-environment-jsdom to 27.0.6

保留你之前的 `moduleDirectories` 、 `collectCoverageFrom` 和其他你觉得必要的配置，如果你不知道哪个配置是必要的，你可以一个一个的转移原有配置，直到你的所有测试用例全部通过。

如果你遇到问题，可以通过 [issues](https://github.com/umijs/umi/issues) 获得帮助。