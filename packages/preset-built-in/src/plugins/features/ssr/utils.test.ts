import { findRoute } from './utils';

test('normal', () => {
  expect(
    findRoute(
      [
        {
          path: '/',
          component: 'layout',
          routes: [
            { path: '/', exact: true, component: 'Home' },
            { path: '/users', exact: true, component: 'Users' },
          ],
        },
      ],
      '/users',
    ),
  ).toEqual({
    path: '/users',
    exact: true,
    component: 'Users',
    match: {
      isExact: true,
      params: {},
      path: '/users',
      url: '/users',
    }
  });
});

test('exacted routes', () => {
  expect(
    findRoute(
      [
        {
          path: '/',
          component: 'layout',
          routes: [
            {
              path: '/',
              component: 'Home',
              exact: true,
            },
            {
              path: '/about',
              component: 'AboutLayout',
              routes: [
                {
                  component: 'AboutIndex',
                  path: '/about',
                  exact: true,
                },
              ],
            },
            {
              path: '/users',
              component: 'Users',
              // test here
              routes: [
                {
                  path: '/users/test',
                  component: 'UserTest',
                  exact: true,
                },
              ],
            },
          ],
        },
      ],
      '/about',
    ),
  ).toEqual({
    path: '/about',
    exact: true,
    component: 'AboutIndex',
    match: {
      isExact: true,
      path: '/about',
      url: '/about',
      params: {},
    }
  });
});

test('dynamic routes', () => {
  const routes = [
    {
      path: '/',
      component: 'layout',
      routes: [
        {
          path: '/',
          component: 'Home',
          exact: true,
        },
        {
          path: '/about',
          component: 'AboutLayout',
          routes: [
            {
              component: 'AboutIndex',
              path: '/about',
              exact: true,
            },
            {
              component: 'AboutDetail',
              path: '/about/:id',
              exact: true,
            },
          ],
        },
        {
          path: '/users',
          component: 'Users',
          // test here
          routes: [
            {
              path: '/users/test',
              component: 'UserTest',
              exact: true,
            },
          ],
        },
      ],
    },
  ];
  expect(
    findRoute(routes, '/about/1?locale=en-US'),
  ).toEqual({
    component: 'AboutDetail',
    path: '/about/:id',
    exact: true,
    match: {
      isExact: true,
      path: '/about/:id',
      url: '/about/1',
      params: {
        id: '1',
      },
    }
  });
});

test('nested routes', () => {
  expect(
    findRoute(
      [
        {
          path: '/',
          routes: [
            {
              path: '/index.html',
              name: 'welcome',
              icon: 'smile',
              exact: true,
            },
            {
              path: '/',
              name: 'welcome',
              icon: 'smile',
              exact: true,
            },
            {
              path: '/user(.html)?',
              name: 'User',
              icon: 'smile',
              routes: [
                {
                  name: 'aaa',
                  path: '/user/aaa.html',
                  icon: 'smile',
                  exact: true,
                },
              ],
            },
            {
              name: 'count',
              path: '/count.html',
              icon: 'smile',
              exact: true,
            },
            {
              exact: true,
            },
          ],
        },
        {
          exact: true,
        },
      ],
      '/count.html',
    ),
  ).toEqual({
    name: 'count',
    path: '/count.html',
    icon: 'smile',
    exact: true,
    match: {
      url: '/count.html',
      path: '/count.html',
      isExact: true,
      params: {},
    }
  });
});
