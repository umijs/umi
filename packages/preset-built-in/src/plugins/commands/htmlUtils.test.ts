import { getFlatRoutes } from './htmlUtils';

test('getFlatRoutes', () => {
  expect(
    getFlatRoutes({
      routes: [
        {
          path: '/',
          redirect: '/home',
        },
        {
          path: '/bar/',
          routes: [
            {
              path: '/bar/mainIndex',
              component: './TestFrame/MainIndex',
            },
          ],
        },
        {
          path: '/users',
          routes: [{ path: ':id', component: './Users' }],
        },
      ],
    }),
  ).toEqual([
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/bar/',
      routes: [
        {
          path: '/bar/mainIndex',
          component: './TestFrame/MainIndex',
        },
      ],
    },
    {
      path: '/bar/mainIndex',
      component: './TestFrame/MainIndex',
    },
    {
      path: '/users',
      routes: [{ path: ':id', component: './Users' }],
    },
    // TODO: add parent path
    { path: ':id', component: './Users' },
  ]);
});
