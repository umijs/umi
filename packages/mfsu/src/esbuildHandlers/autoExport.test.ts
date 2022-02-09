import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import autoExport from './autoExport';

interface IOpts {
  code: string;
}

async function doTransform({ code }: IOpts): Promise<string> {
  await init;
  const [_, exports] = parse(code);
  return autoExport({ code, exports } as any);
}

test('no exports', async () => {
  expect(await doTransform({ code: `console.log(1);` })).toEqual(
    `
console.log(1);
export const __mfsu = 1;
    `.trim(),
  );
});

test('has exports esm', async () => {
  expect(await doTransform({ code: `export const foo = 1;` })).toEqual(
    `
export const foo = 1;
    `.trim(),
  );

  /**
   * `es-module-lexer` will identify as import syntax
   *  but add `export const __mfsu` not has side effect
   */
  expect(await doTransform({ code: `export * from './foo';` })).toEqual(
    `
export * from './foo';
export const __mfsu = 1;
    `.trim(),
  );

  expect(await doTransform({ code: `export default a;` })).toEqual(
    `
export default a;
    `.trim(),
  );
  expect(await doTransform({ code: `export { a } from 'a';` })).toEqual(
    `
export { a } from 'a';
    `.trim(),
  );
});
