import patchRoutes from './patchRoutes';

describe('patchRoutes', () => {
  it('normal', () => {
    const routes = patchRoutes([{ path: '/a' }]);
    expect(routes).toEqual([{ path: '/a' }]);
  });

  it('without path', () => {
    const routes = patchRoutes([{ component: 'a' }]);
    expect(routes).toEqual([{ component: 'a' }]);
  });

  it('throw error if use dynamic route with exportStatic', () => {
    expect(() => {
      patchRoutes([{ path: '/:a' }], {
        exportStatic: true,
      });
    }).toThrowError(/you should not use exportStatic with dynamic route/);
    expect(() => {
      patchRoutes([{ path: '/a/:b' }], {
        exportStatic: true,
      });
    }).toThrowError(/you should not use exportStatic with dynamic route/);
    expect(() => {
      patchRoutes([{ path: '/a', routes: [{ path: '/a/:b' }] }], {
        exportStatic: true,
      });
    }).toThrowError(/you should not use exportStatic with dynamic route/);
  });

  it('exportStatic without htmlSuffix', () => {
    const routes = patchRoutes([{ path: '/a' }], {
      exportStatic: {},
    });
    expect(routes).toEqual([{ path: '/a' }]);
  });

  it('exportStatic.htmlSuffix', () => {
    const routes = patchRoutes(
      [
        { path: '/a' },
        { path: '/b/' },
        {
          path: '/c',
          routes: [{ path: '/c/d' }, { path: '/c/e/' }],
        },
      ],
      {
        exportStatic: { htmlSuffix: true },
      },
    );
    expect(routes).toEqual([
      { path: '/a.html' },
      { path: '/b.html' },
      {
        path: '/c(.html)?',
        routes: [{ path: '/c/d.html' }, { path: '/c/e.html' }],
      },
    ]);
  });

  it('exportStatic.htmlSuffix with no path route', () => {
    const routes = patchRoutes([{ path: '/a' }, { component: './404.js' }], {
      exportStatic: { htmlSuffix: true },
    });
    expect(routes).toEqual([{ path: '/a.html' }, { component: './404.js' }]);
  });

  it('copy /index.html for / if exportStatic', () => {
    let routes;

    routes = patchRoutes(
      [{ path: '/', exact: true, component: './A' }, { path: '/b', exact: true, component: './B' }],
      { exportStatic: false },
      false,
    );
    expect(routes).toEqual([
      { path: '/', exact: true, component: './A' },
      { path: '/b', exact: true, component: './B' },
    ]);

    routes = patchRoutes(
      [{ path: '/', component: './A' }, { path: '/b', exact: true, component: './B' }],
      { exportStatic: true },
      false,
    );
    expect(routes).toEqual([
      { path: '/', component: './A' },
      { path: '/b', exact: true, component: './B' },
    ]);

    routes = patchRoutes(
      [{ path: '/', exact: true, component: './A' }, { path: '/b', exact: true, component: './B' }],
      { exportStatic: true },
      false,
    );
    expect(routes).toEqual([
      { path: '/index.html', exact: true, component: './A' },
      { path: '/', exact: true, component: './A' },
      { path: '/b', exact: true, component: './B' },
    ]);

    routes = patchRoutes(
      [
        {
          path: '/',
          component: './A',
          routes: [
            { path: '/', exact: true, component: './AA' },
            { path: '/c', exact: true, component: './C' },
          ],
        },
        { path: '/b', exact: true, component: './B' },
      ],
      { exportStatic: true },
      false,
    );
    expect(routes).toEqual([
      {
        path: '/',
        component: './A',
        routes: [
          { path: '/index.html', exact: true, component: './AA' },
          { path: '/', exact: true, component: './AA' },
          { path: '/c', exact: true, component: './C' },
        ],
      },
      { path: '/b', exact: true, component: './B' },
    ]);
  });

  it('Route', () => {
    const routes = patchRoutes([{ path: '/a' }, { path: '/b' }, { path: '/c', routes: [] }], {
      pages: {
        '/a': { Route: './routes/A' },
        '/c': { Route: './routes/C' },
      },
    });
    expect(routes).toEqual([
      { path: '/a', Route: './routes/A' },
      { path: '/b' },
      { path: '/c', routes: [], Route: './routes/C' },
    ]);
  });

  it('404', () => {
    const routes = patchRoutes(
      [{ path: '/404', component: './A' }, { path: '/b' }],
      {},
      /* isProduction */ true,
    );
    expect(routes).toEqual([
      { component: './A', path: '/404' },
      { path: '/b' },
      { component: './A' },
    ]);
  });

  it('404 is not the first one', () => {
    const routes = patchRoutes(
      [{ path: '/b' }, { path: '/404', component: './A' }],
      {},
      /* isProduction */ true,
    );
    expect(routes).toEqual([
      { path: '/b' },
      { component: './A', path: '/404' },
      { component: './A' },
    ]);
  });

  it('404 in child routes', () => {
    const routes = patchRoutes(
      [
        {
          path: '/b',
          routes: [{ path: '/404', component: './A' }, { path: '/c' }],
        },
      ],
      {},
      /* isProduction */ true,
    );
    expect(routes).toEqual([
      {
        path: '/b',
        routes: [{ path: '/404', component: './A' }, { path: '/c' }, { component: './A' }],
      },
    ]);
  });

  it("404 don't transform if not production", () => {
    const routes = patchRoutes(
      [{ path: '/404', component: './A' }, { path: '/b' }],
      {},
      /* isProduction */ false,
    );
    expect(routes).toEqual([{ path: '/404', component: './A' }, { path: '/b' }]);
  });

  it('404 with redirect', () => {
    const routes = patchRoutes(
      [{ path: '/404', redirect: '/foo' }, { path: '/b' }],
      {
        disableRedirectHoist: true,
      },
      /* isProduction */ true,
    );
    expect(routes).toEqual([
      { path: '/404', redirect: '/foo' },
      { path: '/b' },
      { redirect: '/foo' },
    ]);
  });

  it('support old meta Route which is deprecated', () => {
    const routes = patchRoutes([{ path: '/b', meta: { Route: './A' } }]);
    expect(routes).toEqual([{ path: '/b', Route: './A' }]);
  });

  it('redirect hoist', () => {
    const routes = patchRoutes([
      { path: '/a', component: './A' },
      { path: '/b', redirect: '/c' },
      {
        path: '/c',
        routes: [
          { path: '/c/d', component: 'D' },
          { path: '/c/e', redirect: '/c/f' },
          { path: '/c/f', component: 'F' },
        ],
      },
    ]);
    expect(routes).toEqual([
      { path: '/c/e', redirect: '/c/f' },
      { path: '/b', redirect: '/c' },
      { path: '/a', component: './A' },
      {
        path: '/c',
        routes: [{ path: '/c/d', component: 'D' }, { path: '/c/f', component: 'F' }],
      },
    ]);
  });

  it('disable redirect hoist', () => {
    const routes = patchRoutes(
      [
        { path: '/a', component: './A' },
        { path: '/b', redirect: '/c' },
        {
          path: '/c',
          routes: [
            { path: '/c/d', component: 'D' },
            { path: '/c/e', redirect: '/c/f' },
            { path: '/c/f', component: 'F' },
          ],
        },
      ],
      {
        disableRedirectHoist: true,
      },
    );
    expect(routes).toEqual([
      { path: '/a', component: './A' },
      { path: '/b', redirect: '/c' },
      {
        path: '/c',
        routes: [
          { path: '/c/d', component: 'D' },
          { path: '/c/e', redirect: '/c/f' },
          { path: '/c/f', component: 'F' },
        ],
      },
    ]);
  });
});
