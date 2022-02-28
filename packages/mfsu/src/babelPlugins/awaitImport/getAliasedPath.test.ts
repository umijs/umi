import { getAliasedPath } from './getAliasedPath';

const alias = {
  // exact
  exact: {
    // file
    foo$: 'path/to/foo.js',
    'foo-pkg$': 'path/to/foo-pkg.js',
    // dir
    'foo-dir$': 'path/to/foo',
    // scope
    '@scope/foo$': 'path/to/name.js',
  },
  // equal
  equal: {
    // file
    foo: 'path/to/foo.js',
    // dir
    'foo-pkg': 'path/to/foo',
    // scope - file
    '@scope/name': 'path/to/name.js',
    // scope - dir
    '@scope/name-pkg': 'path/to/name',
  },
  // prefix
  prefix: {
    // file
    react: 'path/to/react.js',
    'react-dom': 'path/to/react-dom.js',
    // dir
    foo: 'path/to/foo',
    'foo-pkg': 'path/to/foo-pkg',
    // scope - file
    '@scope/name': 'path/to/name.js',
    // scope - dir
    '@scope/foo': 'path/to/scope/foo',
    '@scope/name-pkg': 'path/to/name',
  },
};

test('alias: exact', () => {
  const check = (v: string) => {
    const imported = getAliasedPath({ value: v, alias: alias.exact });
    const expectImported = alias.exact[`${v}$`];
    expect(imported).toEqual(expectImported);
  };
  Object.keys(alias.exact).forEach((v) => {
    check(v.slice(0, -1));
  });
});

test('alias: equal', () => {
  const check = (v: string) => {
    const imported = getAliasedPath({ value: v, alias: alias.equal });
    const expectImported = alias.equal[v];
    expect(imported).toEqual(expectImported);
  };
  Object.keys(alias.equal).forEach((v) => {
    check(v);
  });
});

test('alias: prefix', () => {
  const getImported = (v: string) => {
    return getAliasedPath({ value: v, alias: alias.prefix });
  };
  Object.keys(alias.prefix).forEach((v) => {
    const imported = getImported(v);
    const expectImported = alias.prefix[v];
    expect(imported).toEqual(expectImported);
  });
  // check dir alias with sub path
  expect(getImported('foo/sub')).toEqual('path/to/foo/sub');
  expect(getImported('foo/')).toEqual('path/to/foo/');
  expect(getImported('foo-pkg/sub')).toEqual('path/to/foo-pkg/sub');
  expect(getImported('@scope/foo/sub')).toEqual('path/to/scope/foo/sub');
  expect(getImported('@scope')).toEqual(undefined);
  expect(getImported('@scope/foo/sub/')).toEqual('path/to/scope/foo/sub/');
  expect(getImported('@scope/name-pkg/sub')).toEqual('path/to/name/sub');
});
