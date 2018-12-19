import getVars from './getConstVarsFromPath';

describe('getConstVarsFromPath', () => {
  it('normal', () => {
    expect(Array.from(getVars('/foo/BAR/fOo_BAR-HellO').entries())).toEqual([
      ['ROUTE_PATH', '/foo/bar/foo_bar-hello'],
      ['BLOCK_NAME_CAMEL_CASE', 'fooBarFooBarHello'],
      ['BLOCK_NAME', 'foo-bar-foo_bar-hello'],
      ['PAGE_NAME_UPPER_CAMEL_CASE', 'FooBarHello'],
      ['PAGE_NAME', 'foo_bar-hello'],
    ]);
  });
});
