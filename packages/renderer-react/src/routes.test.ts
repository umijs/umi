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
  // @ts-ignore
  expect(clientRoutes[0].routes[0].id).toEqual('b');
});
