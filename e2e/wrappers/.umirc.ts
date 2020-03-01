export default {
  routes: [
    {
      path: '/',
      component: 'list',
      wrappers: ['@/wrappers/foo', '@/wrappers/bar'],
    },
  ],
};
