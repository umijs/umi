---
translateHelp: true
---

# Plugin Test


## Why test?

Umi 3 uses a micro-kernel architecture, which means that most functions are loaded in the form of plug-ins.

So **plug-in quality** largely determines the **stability** of Umi's overall function.

When the plug-in has good test cases, it can bring many guarantees:

1. Functional iteration and continuous integration
2. More detailed usage
3. Facilitate code refactoring
4. ...

Then the Umi plug-in test includes:

-Unit test (required) accounts for 95%
  -Pure function test
  -Temporary file test
  -html test
-E2E (optional) accounts for 5%
-Benchmark test (optional)

## Test Framework

> Note: Recommended Node.js version for testing ≥ 10

-[@umijs/test](https://www.npmjs.com/package/@umijs/test), test script, built-in `jest` test framework
-[@testing-library/react](https://testing-library.com/docs/react-testing-library/example-intro), React component testing tool
-[puppeteer](https://github.com/puppeteer/puppeteer), Headless browser tool, used for E2E testing.

Just configure `scripts` on `package.json`:

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

## Test Convention

Directory specification

```bash
.
├── package.json
├── src
│ ├── fixtures # umi item set for plug-in single test
│ │ └── normal
│ │ └── pages
│ ├── index.test.ts # Plug-in test case
│ ├── index.ts # plug-in main file
│ ├── utils.test.ts # Tool function test
│ └── utils.ts
├── example # can be used for E2E testing, a complete umi project
├── test # e2e test case
│ └── index.e2e.ts
├── tsconfig.json
├── .fatherrc.ts
└── yarn.lock
```

Among them, `src/fixtures/*` can be used to test umi's life cycle projects, and the configuration is as follows:

```js
// src/fixtures/normal/.umirc.ts
export default {
  history: 'memory',
  mountElementId: '',
  routes: [{ path: '/', component: './index' }],
};
```

<details>
  <summary>jest configuration module mapping</summary>
`
~~In order to maintain consistency between the test project and the real umi project, we need to map some module paths. There are bugs, but they don’t work:~~

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

## unit test

Plug-in unit tests can be split into:

-Pure function test: do not rely on umi's pure function for testing
-Temporary file test: `.umi-test` project entry file test
-html test: test the generated ʻindex.html`

Let's take the ʻumi-plugin-bar` plugin as an example to learn the Umi plugin test step by step.

### Plug-in function

The functions provided by the ʻumi-plugin-bar` plugin are:

-You can export commonly used ʻutils` methods from ʻumi`
-Load a ga statistics script according to the configured `config.ga = {code:'yourId' }`

#### Pure function test

> Here we agree to use test to write single test for test cases. It is not recommended to use `describe` + ʻit` to nest test cases.

Pure functions do not rely on umi and are relatively simple to test. It is recommended to split complex function points into pure functions, which is conducive to easier testing of plugin functions.

```ts
// src/utils.test.ts
import { getUserName } from './utils';

test('getUserName', () => {
  expect(getUserName('hello world')).toEqual('hello world');
});
```

#### Temporary file test

In order to test that the exported tool functions can be used normally in the component, first create a home page `src/fixtures/normal/index.tsx`

```js
// Real use: import {getUsername} from'umi';
// TODO: jest moduleNameMapper mapping @@/core/umiExports has a bug
import {getUserName} from'../.umi-test/plugin-utils/utils';

export default () => <h1>{getUsername('Hello World')}</h1>;
```

For the part that depends on ʻumi`, you can create a `Service` object from umi. (The `Service` of `@umijs/core` does not have a built-in plugin)

Then use the `@testing-library/react` component rendering library to render our components.

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
  // Used to generate temporary files
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

#### html test

Add `ga: {code:'testId' }` to the configuration of `src/fixtures/normal/.umirc.ts` to facilitate testing of html functions.

Same as [Temporary File Test](#Temporary File Test), when testing html generation, we only need to replace the parameter `tmp` executed by `service` with `html`

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

### Run

Run `yarn test`, the test case is passed, 🎉

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

If you like TDD (Test Driven Development), you can use `yarn test -w` to monitor, [More usage](https://github.com/umijs/umi/blob/master/docs/packages/test.md# usage).

## E2E test

TODO

## Sample code

The complete example code can refer to:

- [ycjcl868/umi3-plugin-test](https://github.com/ycjcl868/umi3-plugin-test)
- [@umijs/plugin-locale](https://github.com/umijs/plugins/tree/master/packages/plugin-locale) Internationalization plugin
- [@umijs/plugin-dva](https://github.com/umijs/plugins/tree/master/packages/plugin-dva) dva Plug-in

## TODO

- Umi UI Plug-in testing program
