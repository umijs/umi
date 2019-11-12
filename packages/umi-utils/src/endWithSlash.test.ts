import endWithSlash from './endWithSlash';

test('normal', () => {
  expect(endWithSlash('./a')).toEqual('./a/');
  expect(endWithSlash('./a/')).toEqual('./a/');
});
