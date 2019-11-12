import isUrl from './isUrl';

test('url', () => {
  expect(isUrl('http://a.com')).toEqual(true);
  expect(isUrl('https://a.com')).toEqual(true);
});

test('not url', () => {
  expect(isUrl('./a')).toEqual(false);
  expect(isUrl('/a')).toEqual(false);
});
