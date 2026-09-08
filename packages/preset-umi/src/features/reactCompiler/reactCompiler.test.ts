import { transformSync } from '@umijs/bundler-utils/compiled/babel/core';
import { dirname, join } from 'path';
import { setup } from '../../../../bundler-webpack/src/dev';
import { defaultRenameVisitor } from '../hmrGuardian/babelPlugin';

const compilerPlugin = [
  require.resolve('babel-plugin-react-compiler'),
  { target: '19' },
];

async function getBabelOptions({
  fastRefresh = true,
  beforeBabelPlugins = [compilerPlugin],
  extraBabelPlugins = [],
  userBabelPlugins = [],
}: {
  fastRefresh?: boolean;
  beforeBabelPlugins?: any[];
  extraBabelPlugins?: any[];
  userBabelPlugins?: any[];
} = {}) {
  const { webpackConfig } = await setup({
    cwd: process.cwd(),
    entry: { umi: './src/index.tsx' },
    config: { mfsu: false, fastRefresh, extraBabelPlugins: userBabelPlugins },
    beforeBabelPlugins,
    extraBabelPlugins,
  });
  const rules = webpackConfig.module!.rules as any[];
  const rule = rules.find((rule) => rule.test?.test('App.tsx'));
  return rule.use.find((use: any) => use.loader.includes('babel-loader'))
    .options;
}

async function compile(source: string, fastRefresh = true) {
  const options = await getBabelOptions({ fastRefresh });
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

const refreshPlugin = require.resolve('react-refresh/babel', {
  paths: [dirname(require.resolve('@umijs/bundler-webpack/package.json'))],
});

function customBeforePlugin() {
  return { visitor: {} };
}
function customExtraPlugin() {
  return { visitor: {} };
}
function userPlugin() {
  return { visitor: {} };
}

test('preserves the existing plugin order without React Compiler', async () => {
  const guardian = defaultRenameVisitor();
  const { plugins } = await getBabelOptions({
    beforeBabelPlugins: [guardian, customBeforePlugin],
    extraBabelPlugins: [customExtraPlugin],
    userBabelPlugins: [userPlugin],
  });
  expect(plugins).toEqual([
    refreshPlugin,
    guardian,
    customBeforePlugin,
    customExtraPlugin,
    userPlugin,
  ]);
});

test.each(
  [
    compilerPlugin,
    'babel-plugin-react-compiler',
    'C:\\app\\node_modules\\babel-plugin-react-compiler\\dist\\index.js',
    dirname(require.resolve('babel-plugin-react-compiler/package.json')),
  ].map((compiler) => [compiler]),
)('moves only React Compiler before Fast Refresh: %p', async (compiler) => {
  const guardian = defaultRenameVisitor();
  const { plugins } = await getBabelOptions({
    beforeBabelPlugins: [customBeforePlugin, compiler, guardian],
    extraBabelPlugins: [customExtraPlugin],
    userBabelPlugins: [userPlugin],
  });
  expect(plugins).toEqual([
    compiler,
    refreshPlugin,
    customBeforePlugin,
    guardian,
    customExtraPlugin,
    userPlugin,
  ]);
});

test('preserves all plugin ordering when Fast Refresh is disabled', async () => {
  const { plugins } = await getBabelOptions({
    fastRefresh: false,
    beforeBabelPlugins: [customBeforePlugin, compilerPlugin],
    extraBabelPlugins: [customExtraPlugin],
    userBabelPlugins: [userPlugin],
  });
  expect(plugins).toEqual([
    customBeforePlugin,
    compilerPlugin,
    customExtraPlugin,
    userPlugin,
  ]);
});

test('does not move unrelated plugins with similar package names', async () => {
  const unrelated = [
    'babel-plugin-react-compiler-helper',
    '/app/node_modules/custom-babel-plugin-react-compiler/index.js',
  ];
  const { plugins } = await getBabelOptions({
    beforeBabelPlugins: [...unrelated, compilerPlugin],
  });
  expect(plugins).toEqual([compilerPlugin, refreshPlugin, ...unrelated]);
});
