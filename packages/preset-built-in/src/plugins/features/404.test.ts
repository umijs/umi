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
  expect(JSON.stringify(routes)).toEqual(
    `[{"path":"/404","exact":true,"component":"404 Pages"},{"path":"/","exact":true,"component":"Index Pages"},{"component":"404 Pages"}]`,
  );
});
