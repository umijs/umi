import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: { exports: string[] };
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve('./stripExports.ts'), opts.opts || {}]],
  })!.code as string;
}

test('basic strip export and remove unused default import', () => {
  const code = doTransform({
    code: `import a from 'a';import b from 'b';b;export function foo() { a; }`,
    opts: {
      exports: ['foo'],
    },
  });

  expect(code).toBe(`import b from 'b';\nb;`);
});

test('basic strip export and remove unused named import ', () => {
  const code = doTransform({
    code: `import { a1, a2 } from 'a';a2;export function foo() { a1; }`,
    opts: {
      exports: ['foo'],
    },
  });
  expect(code).toBe(`import { a2 } from 'a';\na2;`);
});

test('strip different export', () => {
  const code = doTransform({
    code: `import {a, b, c } from 'a';
  import f from 'f'

  export {
    a,
    b as b1, c as c1
  }

  export function foo(){ a; }
  export const d = () => { }, e = () => { };
  export default f;`,
    opts: {
      exports: ['foo', 'a', 'b1', 'c1', 'd', 'f'],
    },
  });
  expect(code).toBe(`export const e = () => {};`);
});
