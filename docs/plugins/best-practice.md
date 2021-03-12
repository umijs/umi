---
translateHelp: true
---

# Plugin Best Practice

## Plugin order adjustment

插件机制底层使用 [tapable](https://github.com/webpack/tapable)，支持插件顺序调换、支持异步（async），执行权重默认为 **0**

例如，有两个插件 `bar` 和 `foo`，

```js
// bar 插件
api.addHTMLScripts(() => {
  return ['https://bar.js'];
});

// foo 插件
api.addHTMLScripts(() => {
  return ['https://foo.js'];
});
```

bar 插件先于 foo 插件注册，这时候执行出来的结果是：

```html
<script src="https://bar.js"></script>
<script src="https://foo.js"></script>
```

此时希望 foo 插件先于 bar 插件，可以用 `stage` 字段，改成如下结构：

```diff
// bar 插件
api.addHTMLScripts(() => {
  return [
    'https://bar.js',
  ]
});

// foo 插件
- api.addHTMLScripts(() => {
-   return [
-     'https://foo.js',
-   ]
- });

+ api.addHTMLScripts({
+  fn: () => {
+   return [
+     'https://foo.js',
+   ]
+  },
+  stage: 1,
+ });
```

这时候执行结果就是：

```html
<script src="https://foo.js"></script>
<script src="https://bar.js"></script>
```

同时，也可以使用 `name` 与 `before` 决定两个插件之间执行顺序：

```diff
// bar 插件
- api.addHTMLScripts(() => {
-   return [
-    'https://bar.js',
-   ]
- });
+ api.addHTMLScripts({
+  fn: () => {
+   return [
+     'https://bar.js',
+   ]
+  },
+  name: 'bar'
+ });

// foo 插件
- api.addHTMLScripts(() => {
-   return [
-     'https://foo.js',
-   ]
- });

+ api.addHTMLScripts({
+  fn: () => {
+   return [
+     'https://foo.js',
+   ]
+  },
+  before: 'bar'
+ });
```

## Plugin Test

### 为什么要测试？

Umi 3 我们采用微内核的架构，意味着大部分功能以插件的形式加载。

所以**插件质量**很大程度决定了 Umi 整体功能的**稳定性**。

当插件有良好的测试用例，能带给很多保障：

1. 功能迭代、持续集成
2. 更详细的用法
3. 利于代码重构
4. ...

那么 Umi 插件的测试包括：

- 单元测试（必选）占 95%
  - 纯函数测试
  - 临时文件测试
  - html 测试
- E2E（可选）占 5%
- 基准测试（可选）

### 测试框架

> 注：建议用于测试的 Node.js 版本 ≥ 10

- [@umijs/test](https://www.npmjs.com/package/@umijs/test)，测试脚本，内置 `jest` 测试框架
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/example-intro)，React 组件测试工具
- [puppeteer](https://github.com/puppeteer/puppeteer)，Headless 浏览器工具，用于 E2E 测试。

只需要在 `package.json` 上配置好 `scripts` 即可：

```json
{
  "scripts": {
    "test": "umi-test"
  },
  "optionalDependencies": {
    "puppeteer": "^2.1.0"
  },
  "devDependencies": {
    "umi": "^3.0.0-beta.7",
    "@types/jest": "^25.1.2",
    "@umijs/test": "^3.0.0-beta.1"
  }
}
```

### 测试约定

目录规范

```bash
.
├── package.json
├── src
│   ├── fixtures # 适用于插件单测的 umi 项目集
│   │   └── normal
│   │       └── pages
│   ├── index.test.ts # 插件测试用例
│   ├── index.ts # 插件主文件
│   ├── utils.test.ts # 工具类函数测试
│   └── utils.ts
├── example # 可用于 E2E 测试，一个完整的 umi 项目
├── test # e2e 测试用例
│   └── index.e2e.ts
├── tsconfig.json
├── .fatherrc.ts
└── yarn.lock
```

其中 `src/fixtures/*` 可用于测试 umi 各生命周期的项目，配置如下：

```js
// src/fixtures/normal/.umirc.ts
export default {
  history: 'memory',
  mountElementId: '',
  routes: [{ path: '/', component: './index' }],
};
```

<details>
  <summary>jest 配置模块映射</summary>

~~为了保持测试项目与真实 umi 项目一致性，我们需要将一些模块路径做映射，有 bug，没跑通：~~

```js
// jest.config.js
module.exports = {
  moduleNameMapper: {
    // 确保 import {} from 'umi' 正常 work
    '^@@/core/umiExports$':
      '<rootDir>/src/fixtures/.umi-test/core/umiExports.ts',
  },
};
```

</details>

### 单元测试

插件单元测试可以拆分成：

- 纯函数测试：不依赖 umi 的纯函数进行测试
- 临时文件测试：`.umi-test` 项目入口文件的测试
- html 测试：对生成出来的 `index.html` 进行测试

我们以 `umi-plugin-bar` 插件为例，循序渐进地学习 Umi 插件测试。

#### 插件功能

`umi-plugin-bar` 插件提供的功能有：

- 从 `umi` 可以导出常用的 `utils` 方法
- 根据配置的 `config.ga = { code: 'yourId' }`，加载一段 ga 统计脚本

##### 纯函数测试

> 这里我们约定测试用例使用 test 书写单测，不推荐使用 `describe` + `it` 测试用例嵌套。

纯函数不依赖 umi，测试起来相对简单，建议将复杂功能点拆分成一个个纯函数，有利于插件功能更易测试。

```ts
// src/utils.test.ts
import { getUserName } from './utils';

test('getUserName', () => {
  expect(getUserName('hello world')).toEqual('hello world');
});
```

##### 临时文件测试

为了测试导出的工具类函数在组件里能正常使用，先创建一个首页 `src/fixtures/normal/index.tsx`

```js
// 真实使用：import { getUsername } from 'umi';
// TODO: jest moduleNameMapper 映射 @@/core/umiExports 有 bug
import { getUserName } from '../.umi-test/plugin-utils/utils';

export default () => <h1>{getUsername('Hello World')}</h1>;
```

对依赖 `umi` 的部分，可以通过从 umi 中创建一个 `Service` 对象。(`@umijs/core` 的 `Service` 不内置插件)

然后用 `@testing-library/react` 组件渲染库来渲染出我们的组件。

```jsx
// src/index.test.ts
import { join } from 'path';
import { Service } from 'umi';
import { render } from '@testing-library/react';

const fixtures = join(__dirname, './fixtures');

test('normal tmp', async () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    plugins: [require.resolve('./')],
  });
  // 用于产生临时文件
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });

  const reactNode = require(join(cwd, '.umi-test', 'umi.ts')).default;
  const { container } = render(reactNode);
  expect(container.textContent).toEqual('Hello World');
});
```

##### html 测试

在 `src/fixtures/normal/.umirc.ts` 配置中添加 `ga: { code: 'testId' }` 方便测试 html 功能。

同 [临时文件测试](#临时文件测试)，测试 html 生成时，我们只需将 `service` 执行的参数 `tmp` 换成 `html`

```jsx
// index.test.ts
test('normal html', async () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    plugins: [require.resolve('./')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'html'],
    },
  });

  const html = readFileSync(join(cwd, 'dist', 'index.html'), 'utf-8');
  expect(html).toContain('https://www.googletagmanager.com/gtag/js?id=testId');
});
```

#### 运行

运行 `yarn test`，测试用例就通过了，🎉

```bash
➜ yarn test
$ umi-test
 PASS  src/utils.test.ts
  ✓ getUserName (3ms)

 PASS  src/index.test.ts
  ✓ normal (1661ms)
  ✓ normal html (529ms)

Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        4.257s
Ran all test suites.
    Write: dist/index.html

✨  Done in 5.40s.
```

如果你喜欢 TDD（测试驱动开发），可以使用 `yarn test -w` 监听，[更多用法](https://github.com/umijs/umi/blob/master/docs/packages/test.md#usage)。

### E2E 测试

TODO

### 示例代码

完整实例代码可参照：

- [ycjcl868/umi3-plugin-test](https://github.com/ycjcl868/umi3-plugin-test)
- [@umijs/plugin-locale](https://github.com/umijs/plugins/tree/master/packages/plugin-locale) 国际化插件
- [@umijs/plugin-dva](https://github.com/umijs/plugins/tree/master/packages/plugin-dva) dva 插件
