import { transform } from '@umijs/bundler-utils/compiled/babel/core';
import { basename } from 'path';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  const fileToTest = basename(__filename).replace(/\.test.ts$/, '.ts');
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve(`./${fileToTest}`), opts.opts || {}]],
  })!.code as string;
}

test(`import('a');`, () => {
  const code = doTransform({
    code: `import('a');`,
  });
  expect(code).toContain(
    `Promise.resolve().then(() => _interopRequireWildcard(require('a')));`,
  );
});

test(`import(/*comment*/'a');`, () => {
  const code = doTransform({
    code: `import(/*comment*/'a');`,
  });
  expect(code).toContain(
    `Promise.resolve().then(() => _interopRequireWildcard(require('a')));`,
  );
});
