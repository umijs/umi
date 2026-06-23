export default {
  qiankun: {
    master: {
      apps: [
        {
          name: 'slave',
          entry: 'http://127.0.0.1:5555/@example/with-utoopack-qiankun-slave/',
        },
      ],
    },
  },
  routes: [
    { path: '/', component: 'index' },
    { path: '/slave/*', microApp: 'slave' },
  ],
  utoopack: {},
};
