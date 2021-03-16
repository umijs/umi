import { patchRoutes } from './404';

test('404 js', async () => {
  const routes = [
    {
      path: '/404',
      exact: true,
      component: '404 Pages',
    },
    {
      path: '/',
      exact: true,
      component: 'Index Pages',
    },
  ];
  patchRoutes(routes, { exportStatic: false });
  expect(routes).toEqual([
    {
      path: '/404',
      exact: true,
      component: '404 Pages',
    },
    {
      path: '/',
      exact: true,
      component: 'Index Pages',
    },
    { component: '404 Pages' },
  ]);
});

test('exportStatic', async () => {
  const routes = [
    {
      path: '/404',
      exact: true,
      component: '404 Pages',
    },
    {
      path: '/',
      exact: true,
      component: 'Index Pages',
    },
  ];
  patchRoutes(routes, { exportStatic: {} });
  expect(routes).toEqual([
    {
      path: '/404',
      exact: true,
      component: '404 Pages',
    },
    {
      path: '/',
      exact: true,
      component: 'Index Pages',
    },
  ]);
});

test('404 in child routes', () => {
  const routes = [
    {
      path: '/b',
      routes: [
        {
          path: '/404',
          component: './A',
        },
        {
          path: '/c',
        },
      ],
    },
  ];
  patchRoutes(routes, { exportStatic: false });

  expect(routes).toEqual([
    {
      path: '/b',
      routes: [
        { path: '/404', component: './A' },
        { path: '/c' },
        { component: './A' },
      ],
    },
  ]);
});

test('404 with redirect', () => {
  const routes = [{ path: '/404', redirect: '/foo' }, { path: '/b' }];

  patchRoutes(routes, { exportStatic: false });

  expect(routes).toEqual([
    { path: '/404', redirect: '/foo' },
    { path: '/b' },
    { redirect: '/foo' },
  ]);
});

test('404 not found', () => {
  const routes = [{ path: '/404' }, { path: '/b' }];
  expect(() => {
    patchRoutes(routes, { exportStatic: false });
  }).toThrow(/Invalid route config for \/404/);
});
