import getVars from './getConstVarsFromPath';

describe('getConstVarsFromPath', () => {
  it('normal', () => {
    expect(getVars('/foo/BAR/fOo_BAR-HellO')).toEqual({
      ROUTE_PATH: '/foo/bar/foo_bar-hello',
      BLOCK_NAME: 'foo-bar-foo_bar-hello',
      PAGE_NAME: 'foo_bar-hello',
      PAGE_NAME_UPPER_CAMEL_CASE: 'FooBarHello',
    });
  });
});
