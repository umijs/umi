import { normalizePath } from './utils';

it('normalizePath object', () => {
  expect(
    normalizePath({
      pathname: '/index',
    }),
  ).toEqual({
    pathname: '/index.html',
  });
});

it('normalizePath object with query', () => {
  expect(
    normalizePath({
      pathname: '/index',
      query: { a: 'b' },
    }),
  ).toEqual({
    pathname: '/index.html',
    query: {
      a: 'b',
    },
  });
});

it('normalizePath string', () => {
  expect(normalizePath('/index')).toEqual('/index.html');
});

it('normalizePath string with query', () => {
  expect(normalizePath('/index?a=b')).toEqual('/index.html?a=b');
});
