import getCount from './getPageCountFromRoutes';

describe('getPageCountFromRoutes', () => {
  it('normal', () => {
    const count = getCount([{ path: '/' }, { path: '/a' }, { path: '/b' }]);
    expect(count).toEqual(3);
  });

  it('level 1', () => {
    const count = getCount([
      { path: '/' },
      {
        path: '/a',
        routes: [{ path: '/a/a' }, { path: '/a/b' }],
      },
      { path: '/b' },
    ]);
    expect(count).toEqual(3);
  });

  it('level 2', () => {
    const count = getCount([
      { path: '/', routes: [] },
      {
        path: '/a',
        routes: [{ path: '/a/a' }, { path: '/a/b' }],
      },
      { path: '/b' },
    ]);
    expect(count).toEqual(5);
  });

  it('level 2(2)', () => {
    const count = getCount([
      {
        path: '/',
        routes: [{ path: '/a' }, { path: '/b' }, { path: '/c' }, { path: '/d' }, { path: '/e' }],
      },
    ]);
    expect(count).toEqual(6);
  });
});
