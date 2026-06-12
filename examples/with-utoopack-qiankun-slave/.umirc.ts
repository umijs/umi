export default {
  routes: [
    { path: '/', component: 'index' },
    { path: '/home', component: 'index' },
  ],
  npmClient: 'pnpm',
  publicPath: '/_inf_static/bug/',
  qiankun: {
    slave: {
      appName: 'utoopack-slave',
    },
  },
  utoopack: {},
};
