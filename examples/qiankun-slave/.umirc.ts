export default {
  model: {},
  qiankun: {
    slave: {},
  },
  base: 'manual-slave',
  routes: [
    { path: '/home', component: 'home' },
    { path: '/count', component: 'count' },
    { path: '/nav', component: 'nav' },
  ],
};
