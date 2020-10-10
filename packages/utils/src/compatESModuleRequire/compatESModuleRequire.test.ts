import compatESModuleRequire from './compatESModuleRequire';

test('esm', () => {
  expect(compatESModuleRequire({ __esModule: true, default: 'foo' })).toEqual(
    'foo',
  );
});

test('cjs', () => {
  expect(compatESModuleRequire('foo')).toEqual('foo');
});
