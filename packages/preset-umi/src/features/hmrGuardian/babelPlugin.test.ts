import { transform as babelTransform } from '@umijs/bundler-utils/compiled/babel/core';
import { normalize } from 'path';
import { defaultRenameVisitor } from './babelPlugin';

function transformCode(input: string, filename: string): string {
  const { code } = babelTransform(input, {
    plugins: [defaultRenameVisitor],
    filename: normalize(filename),
    cwd: normalize('/test/src'),
    generatorOpts: {
      compact: false,
      concise: false,
      retainLines: true,
    },
  })!;
  return code!;
}

test('no renaming in node_modules with anonymous array function', () => {
  const input = `export default (() => {});`;
  const code = transformCode(input, '/test/node_modules/ComponentE.jsx');

  expect(code).toBe(input);
});

test('no renaming in node_modules with anonymous function', () => {
  const input = `export default function () {};`;
  const code = transformCode(input, '/test/node_modules/ComponentE.jsx');

  expect(code).toBe(input);
});

test('should rename default exported arrow function', () => {
  const input = `export default () => {};`;
  const output = transformCode(input, '/test/src/ComponentA.jsx');
  expect(output).toBe(`const ComponentA = () => {};export default ComponentA;`);
});

test('should rename default exported function without an identifier', () => {
  const input = `export default function() {}`;
  const output = transformCode(input, '/test/src/ComponentB.jsx');
  expect(output).toBe(`export default function ComponentB() {}`);
});

test('should rename default exported arrow function in .tsx file', () => {
  const input = `export default () => {};`;
  const output = transformCode(input, '/test/src/ComponentC.tsx');
  expect(output).toBe(`const ComponentC = () => {};export default ComponentC;`);
});

test('should rename default exported with long path', () => {
  const input = `export default () => {};`;
  const output = transformCode(
    input,
    '/test/src/head/shoulders/knees/and/toes/ComponentC.tsx',
  );
  expect(output).toBe(
    `const HeadShouldersKneesAndToesComponentC = () => {};export default HeadShouldersKneesAndToesComponentC;`,
  );
});

test('should rename default exported with relative path', () => {
  const input = `export default () => {};`;
  const output = transformCode(input, '/ComponentRoot.tsx');
  expect(output).toBe(
    `const ComponentRoot = () => {};export default ComponentRoot;`,
  );
});

test('should resolve identifier conflict', () => {
  const input = `const ComponentD = 1; export default () => {};`;
  const output = transformCode(input, '/test/src/ComponentD.jsx');
  expect(output).toBe(
    `const ComponentD = 1;const ComponentD0 = () => {};export default ComponentD0;`,
  );
});
