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
        routes: [
          { path: '/foo', routes: [{ path: 'bar', redirect: 'hoo' }] },
          { path: 'bar', redirect: 'hoo' },
          { path: 'http://a.com/b', redirect: 'hoo' },
          { path: 'https://a.com/b', redirect: 'hoo' },
        ],
      },
      root: '/tmp',
    }),
  ).toEqual([
    {
      path: '/foo',
      routes: [{ path: '/foo/bar', redirect: '/foo/hoo', exact: true }],
    },
    { path: '/bar', exact: true, redirect: '/hoo' },
    { path: 'http://a.com/b', exact: true, redirect: '/hoo' },
    { path: 'https://a.com/b', exact: true, redirect: '/hoo' },
  ]);
});

test('config routes with relative path (root path is also relative)', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {
        routes: [
          {
            path: 'foo',
            routes: [
              {
                path: 'bar',
                redirect: 'hoo',
                routes: [{ path: 'bar', redirect: 'hoo' }],
              },
            ],
          },
          { path: 'bar', redirect: 'hoo' },
        ],
      },
      root: '/tmp',
    }),
  ).toEqual([
    {
      path: '/foo',
      routes: [
        {
          path: '/foo/bar',
          redirect: '/foo/hoo',
          routes: [
            { exact: true, path: '/foo/bar/bar', redirect: '/foo/bar/hoo' },
          ],
        },
      ],
    },
    { path: '/bar', exact: true, redirect: '/hoo' },
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
          path: '/workspace/:name?/edit',
          exact: true,
          component: '@/pages/workspace/[name$]/edit.tsx',
        },
        {
          path: '/workspace/:name?/:patch',
          exact: true,
          component: '@/pages/workspace/[name$]/[patch].tsx',
        },
        {
          path: '/users',
          routes: [
            {
              path: '/users/add',
              exact: true,
              component: '@/pages/users/add.tsx',
            },
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
        {
          path: '/:post/:patch?',
          exact: true,
          component: '@/pages/[post]/[patch$].tsx',
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
