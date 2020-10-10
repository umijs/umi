import { generateExports } from './umiExports';

test('export all', () => {
  const exportAll = generateExports({
    item: {
      exportAll: true,
      source: 'dva',
    },
    umiExportsHook: {},
  });
  expect(exportAll).toBe("export * from 'dva';");
});

test('export specifiers', () => {
  const exportSpecifiers = generateExports({
    item: {
      specifiers: ['connect'],
      source: 'dva',
    },
    umiExportsHook: {},
  });
  expect(exportSpecifiers).toBe("export { connect } from 'dva';");
});

test('export alias', () => {
  const exportAlias = generateExports({
    item: {
      specifiers: [{ local: 'default', exported: 'dva' }],
      source: 'dva',
    },
    umiExportsHook: {},
  });
  expect(exportAlias).toBe("export { default as dva } from 'dva';");
});

test('multiple', () => {
  const exportAlias = generateExports({
    item: {
      specifiers: ['a', { local: 'default', exported: 'b' }],
      source: 'dva',
    },
    umiExportsHook: {},
  });
  expect(exportAlias).toEqual("export { a, default as b } from 'dva';");
});

test('reserve library', () => {
  expect(() => {
    generateExports({
      item: {
        specifiers: [
          {
            local: 'default',
            exported: 'dva',
          },
        ],
        source: 'umi',
      },
      umiExportsHook: {},
    });
  }).toThrow("umi is reserve library, Please don't use it.");
});

test('reserve name', () => {
  expect(() => {
    generateExports({
      item: {
        specifiers: ['Link'],
        source: 'dva',
      },
      umiExportsHook: {},
    });
  }).toThrow("Link is reserve name, you can use 'exported' to set alias.");
});

test('repeated definition', () => {
  expect(() => {
    const umiExportsHook = {};
    generateExports({
      item: {
        specifiers: ['connect'],
        source: 'abc',
      },
      umiExportsHook,
    });
    generateExports({
      item: {
        specifiers: ['connect'],
        source: 'abc',
      },
      umiExportsHook,
    });
  }).toThrow("connect is Defined, you can use 'exported' to set alias.");
});
