import { generateExports } from './importFromUmi';

it('export all', () => {
  const exportAll = generateExports({
    exportAll: true,
    source: 'dva',
  });
  expect(exportAll).toBe("export * from 'dva';");
});

it('export specifiers', () => {
  const exportSpecifiers = generateExports({
    specifiers: ['connect'],
    source: 'dva',
  });
  expect(exportSpecifiers).toBe("export { connect } from 'dva';");
});

it('export alias', () => {
  const exportAlias = generateExports({
    specifiers: [{ local: 'default', exported: 'dva' }],
    source: 'dva',
  });
  expect(exportAlias).toBe("export { default as dva } from 'dva';");
});

it('multiple', () => {
  const exportAlias = generateExports({
    specifiers: ['a', { local: 'default', exported: 'b' }],
    source: 'dva',
  });
  expect(exportAlias).toEqual("export { a, default as b } from 'dva';");
});

it('reserve library', () => {
  expect(() => {
    generateExports({
      specifiers: [
        {
          local: 'default',
          exported: 'dva',
        },
      ],
      source: 'umi',
    });
  }).toThrow("umi is reserve library, Please don't use it.");
});

it('reserve name', () => {
  expect(() => {
    generateExports({
      specifiers: ['Link'],
      source: 'dva',
    });
  }).toThrow("Link is reserve name, you can use 'exported' to set alias.");
});

it('repeated definition', () => {
  expect(() => {
    generateExports({
      specifiers: ['connect'],
      source: 'abc',
    });
  }).toThrow("connect is Defined, you can use 'exported' to set alias.");
});
