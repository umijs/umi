import compatESModuleRequire from './compatESModuleRequire';

test('esm', () => {
  expect(compatESModuleRequire({ __esModule: true, default: 'foo' })).toEqual(
    'foo',
  );
});

test('cjs', () => {
  // @ts-expect-error
  expect(compatESModuleRequire('foo')).toEqual('foo');
});
