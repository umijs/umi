import { generateStringsByConfiguration } from '../src/plugins/exports';

it('export all', () => {
  const exportAll = generateStringsByConfiguration({
    exportAll: true,
    source: 'dva',
  });
  expect(exportAll).toBe("export * from 'dva';");
});

it('export specifiers', () => {
  const exportSpecifiers = generateStringsByConfiguration({
    specifiers: ['connect'],
    source: 'dva',
  });
  expect(exportSpecifiers).toBe("export { connect } from 'dva';");
});

it('export alias', () => {
  const exportAlias = generateStringsByConfiguration({
    specifiers: [{ local: 'default', exported: 'dva' }],
    source: 'dva',
  });
  expect(exportAlias).toBe("export { default as dva } from 'dva';");
});

it('reserve library', () => {
  expect(() =>
    generateStringsByConfiguration({
      specifiers: [{ local: 'default', exported: 'dva' }],
      source: 'umi',
    }),
  ).toThrow("umi is reserve library, Please don't use it.");
});

it('reserve name', () => {
  expect(() =>
    generateStringsByConfiguration({
      specifiers: ['umi'],
      source: 'dva',
    }),
  ).toThrow("umi is reserve name, you can use 'exported' to set alias.");
});

it('repeated definition', () => {
  expect(() =>
    generateStringsByConfiguration({
      specifiers: ['connect'],
      source: 'abc',
    }),
  ).toThrow("connect is Defined, you can use 'exported' to set alias.");
});
