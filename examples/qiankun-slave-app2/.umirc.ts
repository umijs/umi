export default {
  qiankun: {
    slave: {},
  },
  model: {},
  headScripts: [`window.publicPath = '//localhost:7002/';`],
  routes: [
    { path: '/', component: 'index' },
    { path: '/hello', component: 'hello' },
  ],
  runtimePublicPath: {},
};
