import findRoute from './findRoute';

test('normal', () => {
  expect(
    findRoute(
      [
        {
          path: '/',
          component: 'layout',
          routes: [{ path: '/', component: 'Home' }, { path: '/users', component: 'Users' }],
        },
      ],
      '/users',
    ),
  ).toEqual({
    path: '/users',
    component: 'Users',
  });
});
