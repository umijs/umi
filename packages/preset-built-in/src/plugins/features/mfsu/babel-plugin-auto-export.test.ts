import { transform } from '@babel/core';

function transformWithPlugin(code: string, opts: {}) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [[require.resolve('./babel-plugin-auto-export.ts'), opts]],
  })!.code;
}

test('no exports', () => {
  expect(transformWithPlugin(`console.log(1);`, {})).toEqual(
    `
console.log(1);
export const __mfsu = 1;
    `.trim(),
  );
});

test('has exports esm', () => {
  expect(transformWithPlugin(`export const foo = 1;`, {})).toEqual(
    `
export const foo = 1;
    `.trim(),
  );
  expect(transformWithPlugin(`export * from './foo';`, {})).toEqual(
    `
export * from './foo';
    `.trim(),
  );
  expect(transformWithPlugin(`export default a;`, {})).toEqual(
    `
export default a;
    `.trim(),
  );
  expect(transformWithPlugin(`export { a } from 'a';`, {})).toEqual(
    `
export { a } from 'a';
    `.trim(),
  );
});

test('has exports cjs', () => {
  expect(transformWithPlugin(`module.exports = 1;`, {})).toEqual(
    `
module.exports = 1;
    `.trim(),
  );
  expect(transformWithPlugin(`exports.foo = 'foo';`, {})).toEqual(
    `
exports.foo = 'foo';
    `.trim(),
  );
});

test("module.exports after variable", ()=>{
  expect(transformWithPlugin(`var a = b = module.exports = {};`,{})).toEqual(
    `var a = b = module.exports = {};`.trim()
  )
});
test("exports after variable", ()=>{
  expect(transformWithPlugin(`var a = b = exports.a = 1;`,{})).toEqual(
    `var a = b = exports.a = 1;`.trim()
  )
})
