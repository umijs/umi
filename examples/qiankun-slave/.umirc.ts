export default {
  qiankun: {
    slave: {},
  },
  base: 'manual-slave',
  routes: [
    { path: '/home', component: 'home' },
    { path: '/count', component: 'count' },
  ],
};
