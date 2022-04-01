export default {
  routes: [
    {
      path: '/',
      redirect: '/index',
      exact: true,
    },
    {
      path: '/index',
      component: './index',
      exact: true,
    },
    {
      path: '/docs',
      component: './docs',
      exact: true,
    },
    {
      component: './404',
    },
  ],
};
