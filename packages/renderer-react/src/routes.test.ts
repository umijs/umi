import { createClientRoutes } from './routes';

test('createClientRoutes', () => {
  const clientRoutes = createClientRoutes({
    routesById: {
      a: { path: '/', id: 'a' },
      b: { path: '/b', id: 'b', parentId: 'a' },
    },
    routeComponents: {
      a: 'component-a',
      b: 'component-b',
    },
  });
  expect(clientRoutes[0].children![0].id).toEqual('b');
});
