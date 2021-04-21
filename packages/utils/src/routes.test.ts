import { routeToChunkName } from './routes';

test('routeToChunkName normal', () => {
  expect(
    routeToChunkName({
      route: { path: '/', component: '@/pages/index.ts' },
    }),
  ).toEqual('p__index');
  expect(
    routeToChunkName({
      route: { path: '/', component: '@/pages/index.tsx' },
    }),
  ).toEqual('p__index');
  expect(
    routeToChunkName({
      route: { path: '/', component: '@/pages/index.jsx' },
    }),
  ).toEqual('p__index');
  expect(
    routeToChunkName({
      route: { path: '/', component: '@/pages/index.js' },
    }),
  ).toEqual('p__index');

  expect(
    routeToChunkName({
      route: { path: '/users/:id', component: '@/pages/users/[id].ts' },
    }),
  ).toEqual('p__users__id');
  expect(
    routeToChunkName({
      route: { path: '/users/:id', component: '@/pages/users/[id].tsx' },
    }),
  ).toEqual('p__users__id');
  expect(
    routeToChunkName({
      route: { path: '/users/:id', component: '@/pages/users/[id].jsx' },
    }),
  ).toEqual('p__users__id');
  expect(
    routeToChunkName({
      route: { path: '/users/:id', component: '@/pages/users/[id].js' },
    }),
  ).toEqual('p__users__id');
});

test('routeToChunkName no route', () => {
  expect(
    routeToChunkName({
      route: {},
    }),
  ).toEqual('');
  // @ts-expect-error
  expect(routeToChunkName()).toEqual('');
});

test('routeToChunkName cwd', () => {
  expect(
    routeToChunkName({
      route: {
        path: '/users/:id',
        component: '/users/test/pages/users/[id].jsx',
      },
      cwd: '/users/test',
    }),
  ).toEqual('p__users__id');
});

test('routeToChunkName cwd escape char', () => {
  expect(
    routeToChunkName({
      route: {
        path: '/users/:id',
        component: '/users/c++/pages/users/[id].jsx',
      },
      cwd: '/users/c++',
    }),
  ).toEqual('p__users__id');
});
