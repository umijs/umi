---
order: 15
toc: content
---
# 测试

自动化测试是保障质量的有效手段，Umi 4 提供单元测试的脚手架。Umi 4 推荐使用 [Jest](https://jestjs.io/) 和 [@testing-library/react](https://github.com/testing-library/react-testing-library) 来完成项目中的单元测试。

## 配置

使用 Umi 4 的微生成器快速地配置好 Jest [参考](./generator#jest-配置生成器)，如果你需要修改 jest 相关的配置，可以在 `jest.config.ts` 修改。


umi 项目

```ts
import { Config, configUmiAlias, createConfig } from 'umi/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    // 覆盖 umi 的默认 jest 配置, 如
    // displayName: "Umi jest",
  })) as Config.InitialOptions;
};
```

@umijs/max 项目

```ts
import { Config, configUmiAlias, createConfig } from '@umijs/max/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    // 覆盖 umi 的默认 jest 配置, 如
    // displayName: "Umi jest",
  })) as Config.InitialOptions;
};
```

配置完后，就可以开始编写单元测试了。

## 与 UI 无关的测试

假设我们需要测试一个 utils 函数 `reverseApiData`, 它将 api 请求的结果 `data` 对象的 key 和 value 互换。

我们推荐将测试文件和被测模块放在同一级目录，这样可以方便查看测试文件以便理解模块的功能。

```txt
.
└── utils
    ├── reverseApiData.test.tss
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

先来写我们第一个测试用例, 确保 `fetcher` 使用传入的 `url` 请求 api 的数据

```ts
import { reverseApiData } from './reverseApiData';

// 测试用例名字表明测试的目的
test('reverseApiData use fetcher to request url', async () => {
  // 测试用例以 3A 的结构来写

  // Arrange 准备阶段，准备 mock 函数或者数据
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(),
  });

  // Act 执行被测对象
  await reverseApiData('https://api.end/point', fetcher);

  // Assert 断言测试结果
  expect(fetcher).toBeCalledWith('https://api.end/point');
});
```

执行测试

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
可以使用`npx jest --watch` 让 jest 进程不退出，这样能省去启动重新 jest 的等待时间。
:::

我们再写一个用例来测试这个工具函数完成了键值的对换功能。

```ts
test('reverseApiData reverse simple object', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { a: 'b' } }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({ b: 'a' });
});
```

让每个测试用例只关注一个功能点，可以让用例在重构的时候给我们更准确的反馈，例如改动破坏了什么功能。更多的用例请参考 [代码](https://github.com/umijs/umi/tree/master/examples/test-test/utils/reverseApiData.test.ts)。

## UI 测试

组件和 UI 相关的测试推荐使用 `@testing-library/react`。

### 渲染结果判断

- 使用 jest 的 snapshot

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

执行 `npx jest` 后会在测试用例同级目录会生成 `__snapshots__` 文件夹和用例的 snapshot，请加入到版本管理中。

- 使用 jest 的 inline snapshot

```tsx
// examples/test-test/components/Greet/Greet.test.tsx
test('renders Greet without name by inline snapshot', () => {
  const { container } = render(<Greet />);

  expect(container).toMatchInlineSnapshot();
});
```

执行 `npx jest` 后会在 `toMatchInlineSnapshot` 函数的参数中填入 snapshot 字符串；这种方式适合渲染结果比较短的内容。

- 使用 @testing-library/jest-dom 断言

```tsx
// examples/test-test/components/Greet/Greet.test.tsx
import '@testing-library/jest-dom';

test('renders Greet without name assert by testing-library', () => {
  const { container } = render(<Greet />);

  const greetDom = screen.getByText('Anonymous');
  expect(greetDom).toBeInTheDocument();
});
```

更多[断言 API](https://github.com/testing-library/jest-dom)

### 组件行为判断

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
