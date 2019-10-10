import getVars from './getConstVarsFromPath';

describe('getConstVarsFromPath', () => {
  it('normal', () => {
    expect(Array.from(getVars('/foo/BAR/fOo_BAR-HellO').entries())).toEqual([
      ['ROUTE_PATH', '/foo/bar/foo_bar-hello'],
      ['BLOCK_NAME_CAMEL_CASE', 'fooAndbarAndfooBarHello'],
      ['BLOCK_NAME', 'fooandbarandfoo_bar-hello'],
      ['PAGE_NAME_UPPER_CAMEL_CASE', 'FooBarHello'],
      ['PAGE_NAME', 'foo_bar-hello'],
    ]);

    expect(Array.from(getVars('/foo/BAR/FooBarHello').entries())).toEqual([
      ['ROUTE_PATH', '/foo/bar/foobarhello'],
      ['BLOCK_NAME_CAMEL_CASE', 'fooAndBarAndFooBarHello'],
      ['BLOCK_NAME', 'fooandbarandfoobarhello'],
      ['PAGE_NAME_UPPER_CAMEL_CASE', 'FooBarHello'],
      ['PAGE_NAME', 'foobarhello'],
    ]);
  });
});
