import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    {
      path: '/',
      component: 'index',
    },
    {
      path: '/about',
      component: 'about',
    },
    {
      path: '/users',
      component: 'users',
      routes: [
        {
          path: ':id',
          component: 'users/foo',
        },
      ],
    },
  ],
});
