import { generateStringsByConfiguration } from '../src/plugins/exports';

it('export all', () => {
  const exportAll = generateStringsByConfiguration({
    exportAll: true,
    source: 'dva',
  });
  expect(exportAll).toBe("export * from 'dva';");
});

it('export specifiers', () => {
  const exportAll = generateStringsByConfiguration({
    specifiers: ['connect'],
    source: 'dva',
  });
  expect(exportAll).toBe("export { connect } from 'dva';");
});

it('export exported', () => {
  const exportAll = generateStringsByConfiguration({
    specifiers: [{ local: 'default', exported: 'dva' }],
    source: 'dva',
  });
  expect(exportAll).toBe("export { default as dva } from 'dva';");
});
