export default {
  qiankun: {
    master: {
      apps: [
        {
          name: 'slave',
          entry: 'http://127.0.0.1:5555', // your slave app address
        },
        {
          name: 'slave-app2',
          entry: 'http://127.0.0.1:7002', // your slave app address
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
      path: '/animal',
      routes: [
        {
          path: '/animal/ant/*',
          microApp: 'slave-app2',
        },
      ],
    },
    {
      path: '/manual-slave/*',
      component: 'manual-slave',
    },
  ],
};
