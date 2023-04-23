import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve('./awaitImport.ts'), opts.opts || {}]],
  })!.code as string;
}

test('import default', () => {
  expect(doTransform({ code: `import a from 'a';`, opts: {} })).toEqual(
    `import a from "mf/a";`,
  );
});

test('import member', () => {
  expect(doTransform({ code: `import { a } from 'a';`, opts: {} })).toEqual(
    `import { a } from "mf/a";`,
  );
});

test('import as', () => {
  expect(doTransform({ code: `import * as a from 'a';`, opts: {} })).toEqual(
    `import * as a from "mf/a";`,
  );
});

test('import as + default', () => {
  expect(doTransform({ code: `import a, * as b from 'a';`, opts: {} })).toEqual(
    `import a, * as b from "mf/a";`,
  );
});

test('dynamic import', () => {
  expect(doTransform({ code: `import('a')`, opts: {} })).toEqual(
    `import("mf/a");`,
  );
});

test('export member', () => {
  expect(doTransform({ code: `export { a } from 'a';`, opts: {} })).toEqual(
    `export { a } from "mf/a";`,
  );
});

// depends on exportDefaultFrom syntax
xtest('export default', () => {
  expect(doTransform({ code: `export a from 'a';`, opts: {} })).toEqual(
    `export a from "mf/a";`,
  );
});

test('export *', () => {
  expect(doTransform({ code: `export * from 'a';`, opts: {} })).toEqual(
    `export * from "mf/a";`,
  );
});

test('onCollectData', () => {
  let data: any;
  expect(
    doTransform({
      code: `import a from 'a'; import b from './b'; import('c');`,
      opts: {
        onCollect(_data: any) {
          data = _data.data;
        },
      },
    }),
  ).toEqual(
    `import a from "mf/a";
import b from './b';
import("mf/c");`,
  );
  expect(Array.from(data.matched).map((item: any) => item.sourceValue)).toEqual(
    ['c', 'a'],
  );
  expect(
    Array.from(data.unMatched).map((item: any) => item.sourceValue),
  ).toEqual(['./b']);
});
