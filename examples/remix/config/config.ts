export default {
  routes: [
    {
      path: '/',
      redirect: '/index',
      exact: true,
    },
    {
      path: '/index',
      component: '@/pages/index',
      exact: true,
    },
    {
      path: '/docs',
      component: '@/pages/docs',
      exact: true,
    },
    {
      component: '@/pages/404',
    },
  ],
};
