import { scanContent } from './scan';

test('normal', async () => {
  expect(
    await scanContent({
      content: `import bar from 'foo';import('hoo');export * from 'xxx';`,
    }),
  ).toEqual({
    deps: [
      { importType: 'import', url: 'foo' },
      { importType: 'dynamicImport', url: 'hoo' },
      { importType: 'export', url: 'xxx' },
    ],
  });
});

test('type', async () => {
  expect(
    await scanContent({
      content: [
        "import type foo1 from 'bar1';",
        "import type { foo2 } from 'bar2';",
        "import { foo3, type foo4 } from 'bar34';",
        "import foo56, { type foo5, type foo6 } from 'bar56';",
        "export type { foo7 } from 'bar7';",
        "export { foo8, type foo9 } from 'bar89';",
        "export { type foo10, type foo11 } from 'bar1011';",
        "export * from 'bar12';",
        "export * as b from 'bar13';",
      ].join(''),
    }),
  ).toEqual({
    deps: [
      { importType: 'import', url: 'bar34' },
      { importType: 'import', url: 'bar56' },
      { importType: 'export', url: 'bar89' },
      { importType: 'export', url: 'bar12' },
      { importType: 'export', url: 'bar13' },
    ],
  });
});
