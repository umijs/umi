import { getNamespace } from './modelUtils';

test('getNamespace', () => {
  expect(getNamespace('/a/b/src/models/foo.ts', '/a/b/src')).toEqual('foo');
  expect(getNamespace('/a/b/src/models/foo.ts', '/a/b/src/')).toEqual('foo');
});

test('getNamespace winPath', () => {
  expect(getNamespace('\\a\\b\\src/models/foo.ts', '/a/b/src')).toEqual('foo');
});

test('getNamespace filter pages', () => {
  expect(getNamespace('/a/b/src/pages/foo/model.ts', '/a/b/src')).toEqual(
    'foo.model',
  );
});

test('getNamespace filter models', () => {
  expect(getNamespace('/a/b/src/pages/foo/models/bar.ts', '/a/b/src')).toEqual(
    'foo.bar',
  );

  expect(
    getNamespace('/a/b/src/pages/foo/models/bar/qux.ts', '/a/b/src'),
  ).toEqual('foo.bar.qux');
});

test('getNamespace strip .model affix', () => {
  expect(getNamespace('/a/b/src/foo/bar.model.ts', '/a/b/src')).toEqual(
    'foo.bar',
  );
});
