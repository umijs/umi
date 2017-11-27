import expect from 'expect';
import { normalizePath } from '../src/utils';

describe('utils', () => {
  it('normalizePath object', () => {
    expect(
      normalizePath({
        pathname: '/index',
      }),
    ).toEqual('/index.html');
  });

  it('normalizePath object with query', () => {
    expect(
      normalizePath({
        pathname: '/index',
        query: { a: 'b' },
      }),
    ).toEqual('/index.html?a=b');
  });

  it('normalizePath string', () => {
    expect(normalizePath('/index')).toEqual('/index.html');
  });

  it('normalizePath string with query', () => {
    expect(normalizePath('/index?a=b')).toEqual('/index.html?a=b');
  });
});
