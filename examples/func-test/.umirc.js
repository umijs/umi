export default {
  spma: 'a111111111111',
  pages: {
    '/': { spmb: 'b2222222222222', context: { title: '首页' } },
    'list.html': { spmb: 'b3333333333333', context: { title: '列表页' } },
  },
  plugins: [
    './plugin1',
    // 'umi-plugin-yunfengdie',
  ],
  loading: './PageLoadingComponent',
  // disableServiceWorker: true,
  // exportStatic: {
  //   htmlSuffix: true,
  // },
};
