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
    `const {
  default: a
} = await import("mf/a");`,
  );
});

test('import member', () => {
  expect(doTransform({ code: `import { a } from 'a';`, opts: {} })).toEqual(
    `const {
  a: a
} = await import("mf/a");`,
  );
});

test('import as', () => {
  expect(doTransform({ code: `import * as a from 'a';`, opts: {} })).toEqual(
    `const a = await import("mf/a");`,
  );
});

test('import as + default', () => {
  expect(doTransform({ code: `import a, * as b from 'a';`, opts: {} })).toEqual(
    `const b = await import("mf/a"),
      {
  default: a
} = b;`,
  );
});

test('dynamic import', () => {
  expect(doTransform({ code: `import('a')`, opts: {} })).toEqual(
    `import("mf/a");`,
  );
});

test('export member', () => {
  expect(doTransform({ code: `export { a } from 'a';`, opts: {} })).toEqual(
    `const {
  a: a
} = await import("mf/a");
export { a };`,
  );
});

// depends on exportDefaultFrom syntax
xtest('export default', () => {
  expect(doTransform({ code: `export a from 'a';`, opts: {} })).toEqual(
    `const {
  default: a
} = await import("mf/a");
export { a };`,
  );
});

test('export *', () => {
  expect(doTransform({ code: `export * from 'a';`, opts: {} })).toEqual(
    `export * from 'a';`,
  );
  expect(
    doTransform({
      code: `export * from 'a';`,
      opts: {
        exportAllMembers: { a: [] },
      },
    }),
  ).toEqual(`1;`);
  expect(
    doTransform({
      code: `export * from 'a';`,
      opts: {
        exportAllMembers: { a: ['x'] },
      },
    }),
  ).toEqual(
    `const __all_exports_a = await import("mf/a");

export const {
  x: x
} = __all_exports_a;`,
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
    `const {
  default: a
} = await import("mf/a");
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
