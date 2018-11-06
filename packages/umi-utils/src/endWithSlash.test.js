import endWithSlash from './endWithSlash';

describe('endWithSlash', () => {
  test('normal', () => {
    expect(endWithSlash('./a')).toEqual('./a/');
    expect(endWithSlash('./a/')).toEqual('./a/');
  });
});
