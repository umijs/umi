import { join } from 'path';
import { Route } from './index';

const fixtures = join(__dirname, 'fixtures');

test('config empty', () => {
  const route = new Route();
  expect(
    route.getRoutes({
      config: { routes: [] },
    }),
  ).toEqual([]);
});

test('conventional normal', () => {
  const route = new Route();
  expect(
    route.getRoutes({
      config: {},
      root: join(fixtures, 'conventional-normal/pages'),
    }),
  ).toEqual([
    {
      path: '/',
      component: '@/layouts/index.ts',
      routes: [
        {
          path: '/',
          exact: true,
          component: '@/pages/index.ts',
        },
        {
          path: '/users',
          routes: [
            {
              path: '/users/:userId',
              exact: true,
              component: '@/pages/users/[userId].ts',
            },
          ],
          component: '@/pages/users/_layout.ts',
        },
        {
          path: '/:post/comments',
          exact: true,
          component: '@/pages/[post]/comments.ts',
        },
        {
          path: '/:post',
          exact: true,
          component: '@/pages/[post]/index.ts',
        },
      ],
    },
  ]);
});

test('conventional index/index', () => {
  const route = new Route();
  expect(
    route.getRoutes({
      config: {},
      root: join(fixtures, 'conventional-index-index/pages'),
    }),
  ).toEqual([
    {
      path: '/',
      exact: true,
      component: '@/pages/index/index.ts',
    },
  ]);
});

test('conventional opts.componentPrefix', () => {
  const route = new Route();
  expect(
    route.getRoutes({
      config: {},
      root: join(fixtures, 'conventional-opts/pages'),
      componentPrefix: '@@@/',
    }),
  ).toEqual([
    {
      path: '/',
      exact: true,
      component: '@@@/pages/index.ts',
    },
  ]);
});

test('getJSON()', () => {
  const route = new Route();
  expect(
    route.getJSON({
      routes: [{ component: '@/foo' }],
    }),
  ).toEqual(
    `
[
  {
    "component": require('@/foo').default
  }
]
  `.trim(),
  );
});

test('getPaths()', () => {
  const route = new Route();
  expect(
    route.getPaths({
      routes: [
        {
          path: '/',
          routes: [{ path: '/' }, { path: '/bar' }, { path: '/:foo' }],
        },
        { path: '/foo' },
        { component: '@/pages/foo' },
      ],
    }),
  ).toEqual(['/', '/bar', '/:foo', '/foo']);
});
