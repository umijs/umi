import findRoute from './findRoute';

test('normal', () => {
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

test('normal2', () => {
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

test('normal3 /about/:id', () => {
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
