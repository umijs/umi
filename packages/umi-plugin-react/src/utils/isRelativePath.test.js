import isRelativePath from './isRelativePath';

describe('isRelativePath', () => {
  test('normal', () => {
    expect(isRelativePath(`./test`)).toEqual(true);
    expect(isRelativePath(`../test`)).toEqual(true);
    expect(isRelativePath(`test`)).toEqual(false);
  });
});
