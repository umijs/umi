---
order: 15
toc: content
translated_at: '2024-03-17T10:00:43.176Z'
---

# Testing

Automated testing is an effective means to ensure quality, and Umi 4 provides scaffolding for unit testing. Umi 4 recommends using [Jest](https://jestjs.io/) and [@testing-library/react](https://github.com/testing-library/react-testing-library) to complete the unit tests in your project.

## Configuration

Quickly configure Jest using Umi 4's micro-generator [reference](./generator#jest-configurator), and if you need to modify the Jest related configuration, you can do so in `jest.config.ts`.

Umi project

```ts
import { Config, configUmiAlias, createConfig } from 'umi/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    // Override the default Jest configuration of Umi, such as
    // displayName: "Umi jest",
  })) as Config.InitialOptions;
};
```

@umijs/max project

```ts
import { Config, configUmiAlias, createConfig } from '@umijs/max/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    // Override the default Jest configuration of Umi, such as
    // displayName: "Umi jest",
  })) as Config.InitialOptions;
};
```

After configuration, you can start writing unit tests.

## Non-UI Related Tests

Suppose we need to test a utils function `reverseApiData` that swaps the keys and values of the `data` object from an API request's result.

It's recommended to place the test file in the same directory as the module being tested for easy review and understanding of the module's functionality.

```txt
.
└── utils
    ├── reverseApiData.test.ts
    └── reverseApiData.ts
```

```ts
// utils/reverseApiData.ts
export async function reverseApiData(url: string, fetcher = fetch) {
  const res = await fetcher(url);
  const json = await res.json();

  const { data = {} } = json;
  const reversed: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    reversed[val] = key;
  }
  return reversed;
}
```

First, let's write our first test case to ensure `fetcher` uses the passed `url` to request API data

```ts
import { reverseApiData } from './reverseApiData';

// The test case name indicates the purpose of the test
test('reverseApiData use fetcher to request url', async () => {
  // Test cases are written in the structure of 3A

  // Arrange stage, prepare mock functions or data
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(),
  });

  // Act on the object under test
  await reverseApiData('https://api.end/point', fetcher);

  // Assert the test result
  expect(fetcher).toBeCalledWith('https://api.end/point');
});
```

Run the tests

```bash
$npx jest
info  - generate files
 PASS  src/utils/reverseApiData.test.ts

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.894 s, estimated 1 s
Ran all test suites.
```

:::info{title=💡}
You can use `npx jest --watch` to keep the Jest process alive, saving you the wait time to start Jest again.
:::

Let's write another case to test the utility function's ability to reverse key-value pairs.

```ts
test('reverseApiData reverse simple object', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { a: 'b' } }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({ b: 'a' });
});
```

Having each test case focus on one aspect of functionality can give us more accurate feedback during refactoring, such as what functionality a change has broken. Please refer to more cases [code](https://github.com/umijs/umi/tree/master/examples/test-test/utils/reverseApiData.test.ts).

## UI Testing

For component and UI-related testing, the use of `@testing-library/react` is recommended.

### Judging the Rendering Result

- Using Jest's snapshot

```tsx
// examples/test-test/components/Greet/Greet.test.tsx
import { render } from '@testing-library/react';
import React from 'react';
import Greet from './Greet';

test('renders Greet without name by snapshot', () => {
  const { container } = render(<Greet />);
  expect(container).toMatchSnapshot();
});
```

After running `npx jest`, a `__snapshots__` folder and the snapshot of the test case will be generated in the directory alongside the test cases. Please add them to version control.

- Using Jest's inline snapshot

```tsx
// examples/test-test/components/Greet/Greet.test.tsx
test('renders Greet without name by inline snapshot', () => {
  const { container } = render(<Greet />);

  expect(container).toMatchInlineSnapshot();
});
```

After running `npx jest`, the snapshot string will be filled in the parameters of the `toMatchInlineSnapshot` function. This method is suitable for short rendering results.

- Using @testing-library/jest-dom assertions

```tsx
// examples/test-test/components/Greet/Greet.test.tsx
import '@testing-library/jest-dom';

test('renders Greet without name assert by testing-library', () => {
  const { container } = render(<Greet />);

  const greetDom = screen.getByText('Anonymous');
  expect(greetDom).toBeInTheDocument();
});
```

For more [assertion APIs](https://github.com/testing-library/jest-dom)

### Judging Component Behavior

```tsx
// examples/test-test/components/Greet/Greet.test.tsx

test('Greet click', async () => {
  const onClick = jest.fn();
  const { container } = render(<Greet onClick={onClick} />);

  const greetDom = screen.getByText('Anonymous');
  await fireEvent.click(screen.getByText(/hello/i));

  expect(onClick).toBeCalledTimes(1);
});
```
