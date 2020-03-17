# Plugin Test


## Why test?

Umi 3 we use a microkernel architecture, which means that most of the functions are loaded as plug-ins.

So **plugin quality** largely determines the **stability** of Umi's overall functionality.

When the plugin has good test cases, it can bring a lot of guarantees:

1. Functional iteration, continuous integration
2. More detailed usage
3. Facilitates code refactoring
4. ...

Then the tests of the Umi plugin include:

- Unit testing (required) accounts for 95%
  - Pure function test
  - Temporary file test
  - html test
- E2E (optional) 5%
- Benchmark (optional)

## Testing framework

> Note: Recommended Node.js version for testing ≥ 10

- [@umijs/test](https://www.npmjs.com/package/@umijs/test), test script, built-in jest test framework
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/example-intro), React component testing tool
- [puppeteer](https://github.com/puppeteer/puppeteer), headless browser tool for E2E testing.

Just configure `scripts` on` package.json`:

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

Catalog Specifications

```bash
.
├── package.json
├── src
│   ├── fixtures # Umi itemsets for plug-in single test
│   │   └── normal
│   │       └── pages
│   ├── index.test.ts # Plug-in test cases
│   ├── index.ts # Plugin main file
│   ├── utils.test.ts # Utility function test
│   └── utils.ts
├── example # Available for E2E testing, a complete umi project
├── test # e2e test case
│   └── index.e2e.ts
├── tsconfig.json
├── .fatherrc.ts
└── yarn.lock
```

Among them, `src / fixtures / *` can be used to test the projects of each life cycle of umi, the configuration is as follows:

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

~~In order to maintain the consistency of the test project and the real umi project, we need to map some module paths, there are bugs, and they do not work:~~

```js
// jest.config.js
module.exports = {
  moduleNameMapper: {
    // Make sure 'import {} from umi' works
    '^@@/core/umiExports$':
      '<rootDir>/src/fixtures/.umi-test/core/umiExports.ts',
  },
};
```

</details>

## unit test

Plug-in unit tests can be split into:

- Pure function testing: Testing without relying on pure functions of umi
- Temporary file test: `.umi-test` project entry file test
- html test: test the generated `index.html`

Let's take the `umi-plugin-bar` plugin as an example and learn Umi plugin testing step by step.

### Plug-in functions

The features provided by the `umi-plugin-bar` plugin are:

- Export common utils methods from umi
- Load a ga statistics script according to the configured `config.ga = {code: 'yourId'}`

#### Pure function test

> Here we agree that test cases use test to write single tests. It is not recommended to use `describe` +` it` test case nesting.

Pure functions do not depend on umi and are relatively simple to test. It is recommended that complex function points be split into pure functions, which is easier for plug-in functions to test.

```ts
// src/utils.test.ts
import { getUserName } from './utils';

test('getUserName', () => {
  expect(getUserName('hello world')).toEqual('hello world');
});
```

#### Temporary file test

In order to test that the exported utility functions can be used normally in the component, first create a homepage `src/fixtures/normal/index.tsx`

```js
// Real use: import { getUsername } from 'umi';
// TODO: jest moduleNameMapper mapping @@/core/umiExports has bugs
import { getUserName } from '../.umi-test/plugin-utils/utils';

export default () => <h1>{getUsername('Hello World')}</h1>;
```

For the part that depends on `umi`, you can create a `Service` object from umi. (The `Service` of `@umijs/core` does not have a built-in plugin)

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

Add `ga: {code: 'testId'}` to `src/fixtures/normal/.umirc.ts` configuration to test html functions.

Same as [temporary file test](#temporaryfiletest), when testing html generation, we only need to replace `tmp`, which is the parameter of `service` execution, with `html`.

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

### run

Run `yarn test` and the test case will pass 🎉

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

If you like TDD (test-driven development), you can use `yarn test -w` to listen, [more usage](https://github.com/umijs/umi/blob/master/docs/packages/test.md#usage)。

## E2E test

TODO

## Sample code

The complete example code can refer to:

- [ycjcl868/umi3-plugin-test](https://github.com/ycjcl868/umi3-plugin-test)
- [@umijs/plugin-locale](https://github.com/umijs/plugins/tree/master/packages/plugin-locale) Internationalization plugin
- [@umijs/plugin-dva](https://github.com/umijs/plugins/tree/master/packages/plugin-dva) dva Plugin

## TODO

- Umi UI plug-in test solution
