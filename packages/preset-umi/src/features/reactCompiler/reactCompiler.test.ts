import { transformSync } from '@umijs/bundler-utils/compiled/babel/core';
import { join } from 'path';
import { setup } from '../../../../bundler-webpack/src/dev';

const compilerPlugin = [
  require.resolve('babel-plugin-react-compiler'),
  { target: '19' },
];

async function compile(source: string, fastRefresh = true) {
  const { webpackConfig } = await setup({
    cwd: process.cwd(),
    entry: { umi: './src/index.tsx' },
    config: { mfsu: false, fastRefresh },
    beforeBabelPlugins: [compilerPlugin],
  });
  const rules = webpackConfig.module!.rules as any[];
  const rule = rules.find((rule) => rule.test?.test('App.tsx'));
  const options = rule.use.find((use: any) =>
    use.loader.includes('babel-loader'),
  ).options;
  // Strip babel-loader options before invoking Babel core directly.
  const { cacheDirectory, customize, ...babelOptions } = options;
  return transformSync(source, {
    ...babelOptions,
    envName: 'development',
    filename: join(process.cwd(), 'src/App.tsx'),
  })!.code!;
}

const counter = `
import { useState } from 'react';
export default function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
}
`;

test('preserves Fast Refresh hook signatures with React Compiler', async () => {
  const output = await compile(counter);
  expect(output).toContain('react/compiler-runtime');
  expect(output).toContain('$RefreshReg$');
  expect(output).toContain('$RefreshSig$');
});

test('still compiles components when Fast Refresh is disabled', async () => {
  const output = await compile(counter, false);
  expect(output).toContain('react/compiler-runtime');
  expect(output).not.toContain('$RefreshSig$');
  expect(output).not.toContain('$RefreshReg$');
});

test('keeps hook signatures stable for text edits but changes them for new hooks', async () => {
  const signature = (output: string) =>
    output.match(/\w+\(App, "([^"]+)"/)?.[1];
  const original = signature(await compile(counter));
  const textEdit = signature(
    await compile(counter.replace('Count {', 'Clicks {')),
  );
  const hookEdit = signature(
    await compile(
      counter.replace('return <button', 'useState(1); return <button'),
    ),
  );

  expect(original).toBeDefined();
  expect(textEdit).toBe(original);
  expect(hookEdit).toBeDefined();
  expect(hookEdit).not.toBe(original);
});
