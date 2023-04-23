import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { getImportHandlerV4 } from './';

interface IOpts {
  code: string;
  opts?: any;
}

async function doTransform({ code }: IOpts): Promise<string> {
  const handler = getImportHandlerV4({
    resolveImportSource: (source: string): string => {
      if (source === 'a') {
        return 'mf/a' as string;
      }
      return source;
    },
  });
  await init;
  const [imports, _] = parse(code);
  return handler({
    code: code,
    imports,
  } as any);
}

test('import default', async () => {
  expect(await doTransform({ code: `import a from 'a';` })).toEqual(
    `import a from 'mf/a';`,
  );
});

test('import member', async () => {
  expect(await doTransform({ code: `import { a } from 'a';` })).toEqual(
    `import { a } from 'mf/a';`,
  );
});

test('import as', async () => {
  expect(await doTransform({ code: `import * as a from 'a';` })).toEqual(
    `import * as a from 'mf/a';`,
  );
});

test('import as + default', async () => {
  expect(await doTransform({ code: `import a, * as b from 'a';` })).toEqual(
    `import a, * as b from 'mf/a';`,
  );
});

test('dynamic import', async () => {
  expect(await doTransform({ code: `() => import('a');` })).toEqual(
    `() => import("mf/a");`,
  );
  expect(await doTransform({ code: `await import('a');` })).toEqual(
    `await import("mf/a");`,
  );
});

test('export member', async () => {
  expect(await doTransform({ code: `export { a } from 'a';` })).toEqual(
    `export { a } from 'mf/a';`,
  );
});

test('export default', async () => {
  /**
   * esbuild not support `export-default-from` (stage 1)
   * @see https://github.com/tc39/proposal-export-default-from
   */
  // expect(await doTransform({ code: `export a from 'a';` })).toEqual(
  //   `export a from 'mf/a';`,
  // );

  // support normal export default
  expect(
    await doTransform({ code: `export { default as a } from 'a';` }),
  ).toEqual(`export { default as a } from 'mf/a';`);
});

test('export *', async () => {
  expect(await doTransform({ code: `export * from 'a';` })).toEqual(
    `export * from 'mf/a';`,
  );
});
