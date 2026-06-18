export default {
  routes: [{ path: '/', component: 'index' }],
  npmClient: 'pnpm',
  publicPath: '/@example/with-utoopack-qiankun-slave/',
  qiankun: {
    slave: {
      appName: 'slave',
    },
  },
  utoopack: {},
};
