# Testing

Automated testing is an effective means of ensuring quality, and Umi 4 provides a scaffolding for unit testing. Umi 4 recommends using [Jest](https://jestjs.io/) and [@testing-library/react](https://github.com/testing-library/react-testing-library) for unit testing in your project.

## Configuration

Use the micro generator in Umi 4 to quickly set up Jest [reference](./generator#jest-configuration-generator). If you need to modify the Jest-related configuration, you can do so in the `jest.config.ts` file.

<Tabbed>

For a Umi project:

```ts
import { Config, configUmiAlias, createConfig } from 'umi/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    // Override Umi's default Jest configuration, such as
    // displayName: "Umi jest",
  })) as Config.InitialOptions;
};
```

For a @umijs/max project:

```ts
import { Config, configUmiAlias, createConfig } from '@umijs/max/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    // Override Umi's default Jest configuration, such as
    // displayName: "Umi jest",
  })) as Config.InitialOptions;
};
```

</Tabbed>

After configuration, you can start writing unit tests.

## Testing UI-Independent Logic

Suppose we need to test a utility function called `reverseApiData`, which swaps the keys and values of an `data` object obtained from an API request.

We recommend placing the test file in the same directory as the module being tested. This makes it easier to understand the module's functionality by viewing the test file.

```txt
.
└── utils
    ├── reverseApiData.test.ts
    └── reverseApiData.ts
```

Here's the implementation of the utility function:

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

Let's start by writing our first test case to ensure that the `fetcher` uses the provided `url` to request API data:

```ts
import { reverseApiData } from './reverseApiData';

test('reverseApiData use fetcher to request url', async () => {
  // Arrange (Setup) phase: Prepare mock functions or data
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(),
  });

  // Act phase: Execute the function being tested
  await reverseApiData('https://api.end/point', fetcher);

  // Assert phase: Assert the test result
  expect(fetcher).toBeCalledWith('https://api.end/point');
});
```

Run the test:

```bash
$ npx jest
info  - generate files
 PASS  src/utils/reverseApiData.test.ts

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.894 s, estimated 1 s
Ran all test suites.
```

<Message emoji="💡">
You can use `npx jest --watch` to keep the Jest process running, eliminating the need to restart Jest every time.
</Message>

Let's write another test case to test the functionality of this utility function: swapping key-value pairs.

```ts
test('reverseApiData reverse simple object', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { a: 'b' } }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({ b: 'a' });
});
```

Remember to focus each test case on a specific aspect of functionality. This makes it easier to get precise feedback during refactoring, indicating which functionality might have been affected by changes. For more test cases, you can refer to the [example](https://github.com/umijs/umi/tree/master/examples/test-test/utils/reverseApiData.test.ts).

## UI Testing

For testing components and UI-related code, we recommend using `@testing-library/react`.

### Rendering Result Assertion

- Using Jest snapshots

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

After running `npx jest`, a `__snapshots__` folder will be generated in the same directory as the test case, along with the snapshots. Include these snapshots in version control.

- Using Jest inline snapshots

```tsx
// examples/test-test/components/Greet/Greet.test.tsx
test('renders Greet without name by inline snapshot', () => {
  const { container } = render(<Greet />);

  expect(container).toMatchInlineSnapshot();
});
```

After running `npx jest`, the snapshot string will be filled into the argument of the `toMatchInlineSnapshot` function. This method is suitable for rendering results with shorter content.

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

For more assertion APIs, refer to the [Jest DOM](https://github.com/testing-library/jest-dom) documentation.

### Component Behavior Assertion

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
