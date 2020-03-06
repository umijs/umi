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

test('config routes with relative path', async () => {
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

test('config routes with relative path (root path is also relative)', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {
        routes: [
          { path: 'foo', routes: [{ path: 'bar', routes: [{ path: 'bar' }] }] },
          { path: 'bar' },
        ],
      },
      root: '/tmp',
    }),
  ).toEqual([
    {
      path: '/foo',
      routes: [
        { path: '/foo/bar', routes: [{ exact: true, path: '/foo/bar/bar' }] },
      ],
    },
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
      component: '@/layouts/index.tsx',
      routes: [
        {
          path: '/',
          exact: true,
          component: '@/pages/index.tsx',
        },
        {
          path: '/users',
          routes: [
            {
              path: '/users/:userId',
              exact: true,
              component: '@/pages/users/[userId].tsx',
            },
          ],
          component: '@/pages/users/_layout.tsx',
        },
        {
          path: '/:post/comments',
          exact: true,
          component: '@/pages/[post]/comments.tsx',
        },
        {
          path: '/:post',
          exact: true,
          component: '@/pages/[post]/index.tsx',
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
      component: '@/pages/index/index.tsx',
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
      component: '@@@/pages/index.tsx',
    },
  ]);
});

test('conventional opts.singular', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {
        singular: true,
      },
      root: join(fixtures, 'conventional-singular-layout/pages'),
      componentPrefix: '@@@/',
    }),
  ).toEqual([
    {
      path: '/',
      component: '@@@/layout/index.tsx',
      routes: [
        {
          path: '/',
          exact: true,
          component: '@@@/pages/index.tsx',
        },
      ],
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
