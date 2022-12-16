export default {
  qiankun: {
    master: {
      apps: [
        {
          name: 'slave',
          entry: 'http://127.0.0.1:5555', // your slave app address
        },
      ],
    },
    slave: {},
  },
  base: '/',
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: 'index' },
    {
      path: '/slave/*',
      microApp: 'slave',
    },
    {
      path: '/manual-slave/*',
      component: 'manual-slave',
    },
  ],
};
