export default {
  base: '/foo',
  publicPath: '/foo/',
  deadCode: {},
  // https: {},
  headScripts: [`console.log('head script')`],
  npmClient: 'pnpm',
  crossorigin: {},
  presets: [require.resolve('@umijs/preset-vue')],
  polyfill: false,
  // vite: {},
  title: 'boilerplate - umi 4 & vue',
  scripts: [
    `/*alert(2);*/`,
    'https://gw.alipayobjects.com/os/lib/marked/2.0.0/marked.min.js',
  ],
  externals: {
    marked: 'marked',
  },
  // 注释 routes 即开启约定式路由
  routes: [
    {
      path: '/',
      component: 'index',
    },
    {
      path: '/docs',
      component: 'docs',
    },
    {
      path: '/about',
      component: 'about',
    },
    {
      path: '/list',
      component: 'list',
      wrappers: ['@/wrappers/hello'],
      routes: [
        {
          path: 'foo',
          component: 'list/foo',
        },
        {
          path: ':id',
          component: 'list/$id',
        },
      ],
    },
    {
      path: '/users',
      routes: [
        {
          path: '',
          redirect: '/users/login',
        },
        {
          path: 'login',
          component: 'users/login',
        },
      ],
    },
    {
      path: '/jsx-demo',
      component: 'demo-jsx',
    },
    {
      // 404
      path: '/:pathMatch(.*)*',
      component: '@/components/404',
    },
  ],
};
