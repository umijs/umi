import { transform } from '@babel/core';

function transformWithPlugin(code: string) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [[require.resolve('./index.ts'), {}]],
  })!.code;
}

test('match', () => {
  expect(transformWithPlugin(`import 'core-js/foo'`)).toContain(
    `node_modules/core-js/foo`,
  );
});

test('not match', () => {
  expect(transformWithPlugin(`import 'foo'`)).toEqual(`import 'foo';`);
});
