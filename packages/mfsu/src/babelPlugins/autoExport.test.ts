import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve('./autoExport.ts'), opts.opts || {}]],
  })!.code as string;
}

test('no exports', () => {
  expect(doTransform({ code: `console.log(1);` })).toEqual(
    `
console.log(1);
export const __mfsu = 1;
    `.trim(),
  );
});

test('has exports esm', () => {
  expect(doTransform({ code: `export const foo = 1;` })).toEqual(
    `
export const foo = 1;
    `.trim(),
  );
  expect(doTransform({ code: `export * from './foo';` })).toEqual(
    `
export * from './foo';
    `.trim(),
  );
  expect(doTransform({ code: `export default a;` })).toEqual(
    `
export default a;
    `.trim(),
  );
  expect(doTransform({ code: `export { a } from 'a';` })).toEqual(
    `
export { a } from 'a';
    `.trim(),
  );
});

test('has exports cjs', () => {
  expect(doTransform({ code: `module.exports = 1;` })).toEqual(
    `
module.exports = 1;
    `.trim(),
  );
  expect(doTransform({ code: `exports.foo = 'foo';` })).toEqual(
    `
exports.foo = 'foo';
    `.trim(),
  );
});
