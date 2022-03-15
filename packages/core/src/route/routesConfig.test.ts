import { getConfigRoutes } from './routesConfig';

test('normal', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
        },
        {
          path: '/foo',
          component: 'foo',
        },
      ],
    }),
  ).toEqual({
    1: {
      file: 'index',
      path: '/',
      absPath: '/',
      id: '1',
      parentId: undefined,
    },
    2: {
      file: 'foo',
      path: '/foo',
      id: '2',
      absPath: '/foo',
      parentId: undefined,
    },
  });
});

test('child routes', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
          routes: [
            { path: 'bar', component: 'bar' },
            { path: 'foo', component: 'foo' },
          ],
        },
      ],
    }),
  ).toEqual({
    1: {
      file: 'index',
      path: '/',
      id: '1',
      parentId: undefined,
      absPath: '/',
    },
    2: {
      file: 'bar',
      id: '2',
      parentId: '1',
      path: 'bar',
      absPath: '/bar',
    },
    3: {
      file: 'foo',
      id: '3',
      parentId: '1',
      path: 'foo',
      absPath: '/foo',
    },
  });
});
