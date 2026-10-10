// name must equal master qiankun.apps[].name (cache key: qiankun_/${name}/)
const { name } = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: ['umi-plugin-keep-alive'],
  qiankun: {
    slave: {},
  },
  // Prod: serve under /${name}/; dev: master injects basename at runtime.
  base: isProd ? `/${name}/` : '/',
  publicPath: isProd ? `/${name}/` : '/',
  routes: [
    // Each page gets its own KeepAlive via wrappers (render page with Outlet).
    {
      path: '/',
      component: 'index',
      wrappers: ['@/keepAlive/index'],
    },
    {
      path: '/about',
      component: 'about',
      wrappers: ['@/keepAlive/index'],
    },
  ],
  hash: false,
  mfsu: false,
};
