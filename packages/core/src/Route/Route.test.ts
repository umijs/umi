import { join } from 'path';
import Route from './Route';

const fixtures = join(__dirname, 'fixtures');

test('config empty', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: { routes: [] },
      root: '/tmp',
    }),
  ).toEqual([]);
});

test('config routes', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {
        routes: [
          {
            path: '/',
            component: '../layouts/SecurityLayout',
            routes: [
              {
                path: '/',
                component: '../layouts/BasicLayout',
                routes: [
                  {
                    path: '/',
                    redirect: '/welcome',
                  },
                  { component: './404' },
                ],
              },
              { component: './404' },
            ],
          },
          { component: './404' },
        ],
      },
      root: '/tmp',
    }),
  ).toEqual([
    {
      path: '/',
      component: '/layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '/layouts/BasicLayout',
          routes: [
            {
              exact: true,
              path: '/',
              redirect: '/welcome',
            },
            {
              exact: true,
              component: '/tmp/404',
            },
          ],
        },
        {
          exact: true,
          component: '/tmp/404',
        },
      ],
    },
    {
      exact: true,
      component: '/tmp/404',
    },
  ]);
});

test('config routes', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {
        routes: [{ path: '/foo', routes: [{ path: 'bar' }] }, { path: 'bar' }],
      },
      root: '/tmp',
    }),
  ).toEqual([
    { path: '/foo', routes: [{ path: '/foo/bar', exact: true }] },
    { path: '/bar', exact: true },
  ]);
});

test('conventional normal', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
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

test('conventional index/index', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
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

test('conventional opts.componentPrefix', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
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
      config: {},
      cwd: '/foo/bar/',
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
