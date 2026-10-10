export default {
  plugins: ['umi-plugin-keep-alive'],
  mfsu: false,
  qiankun: {
    keepAlive: true,
    master: {
      apps: [
        {
          // Must match slave package.json name + route microApp
          name: 'app1',
          entry: 'http://127.0.0.1:8891',
          // Injected as slave history.basename; keep aligned with path prefix
          base: '/app1',
        },
        {
          name: 'app2',
          entry: 'http://127.0.0.1:8892',
          base: '/app2',
        },
      ],
    },
  },
  base: '/',
  routes: [
    { path: '/', component: 'index' },
    { path: '/app1/*', microApp: 'app1' },
    { path: '/app2/*', microApp: 'app2' },
  ],
};
