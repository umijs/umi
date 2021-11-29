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
