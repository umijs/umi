import { getNamespace, getSortedNamespaces } from './modelUtils';

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

test('getSortedNamespaces no dep', () => {
  expect(
    getSortedNamespaces([
      {
        namespace: 'a',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'b',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'c',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
    ]),
  ).toEqual(['a', 'b', 'c']);
});

test('getSortedNamespaces simple dep', () => {
  expect(
    getSortedNamespaces([
      {
        namespace: 'a',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'b',
        deps: ['c'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'c',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
    ]),
  ).toEqual(['a', 'c', 'b']);
});

test('getSortedNamespaces simple deps', () => {
  expect(
    getSortedNamespaces([
      {
        namespace: 'a',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'b',
        deps: ['c'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'c',
        deps: ['d'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'd',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
    ]),
  ).toEqual(['a', 'd', 'c', 'b']);
});

test('getSortedNamespaces complex deps', () => {
  expect(
    getSortedNamespaces([
      {
        namespace: 'a',
        deps: ['b', 'c'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'b',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'c',
        deps: ['b'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'd',
        deps: ['c', 'b', 'a'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'e',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
    ]),
  ).toEqual(['b', 'c', 'a', 'd', 'e']);
});

test('getSortedNamespaces detect duplicate', () => {
  try {
    getSortedNamespaces([
      {
        namespace: 'a',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'a',
        deps: [],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
    ]);
  } catch (e) {
    expect(e.message).toBe('Duplicate namespace in models: a');
  }
});

test('getSortedNamespaces detect circle', () => {
  try {
    getSortedNamespaces([
      {
        namespace: 'a',
        deps: ['c'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'b',
        deps: ['a'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
      {
        namespace: 'c',
        deps: ['b'],
        id: '',
        exportName: '',
        file: '',
        findDeps: () => [],
      },
    ]);
  } catch (e) {
    expect(e.message).toBe('Circle dependency detected in models: a, b, c');
  }
});
