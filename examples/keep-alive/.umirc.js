export default {
  plugins: [
    [
      '../../packages/umi-plugin-react/lib/index.js',
      {
        antd: true,
        dynamicImport: {
          webpackChunkName: true,
        },
        title: '默认标题',
      },
    ],
  ],
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [
        {
          path: '/',
          component: './index',
        },
        {
          path: '/list',
          component: './list',
          keepAlive: true,
        },
        {
          path: '/item',
          component: './item',
        },
      ],
    },
  ],
  exportStatic: true,
};
