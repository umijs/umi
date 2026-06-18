export default {
  routes: [{ path: '/', component: 'index' }],
  npmClient: 'pnpm',
  publicPath: '/_inf_static/bug/',
  qiankun: {
    slave: {
      appName: 'slave',
    },
  },
  utoopack: {},
};
