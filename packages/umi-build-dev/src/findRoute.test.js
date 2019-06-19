import findRoute from './findRoute';

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
  });
});
