import findRoute, { getUrlQuery } from './findRoute';

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
    params: {},
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
    params: {},
  });
});

test('dynamic routes', () => {
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
      ],
      '/about/1',
    ),
  ).toEqual({
    component: 'AboutDetail',
    path: '/about/:id',
    exact: true,
    params: {
      id: '1',
    },
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
    params: {},
  });
});

test('test getUrlQuery', () => {
  expect(getUrlQuery('?locale=zh-CN')).toEqual({
    locale: 'zh-CN',
  });

  expect(getUrlQuery('?locale=zh-CN&username=umi')).toEqual({
    locale: 'zh-CN',
    username: 'umi',
  });

  expect(getUrlQuery('?')).toEqual({});
  expect(getUrlQuery('')).toEqual({});
  expect(getUrlQuery(undefined)).toEqual({});
  expect(getUrlQuery(null)).toEqual({});
});
