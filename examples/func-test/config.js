export default {
  spma: 'a111111111111',
  pages: {
    '/': { spmb: 'b2222222222222', context: { title: '首页' } },
    'list.html': { spmb: 'b3333333333333', context: { title: '列表页' } },
    '/dynamic': { spmb: 'b3333333333333', context: { title: '动态页' } },
  },
  plugins: [
    './plugin1',
    // 'umi-plugin-yunfengdie',
  ],
  // disableServiceWorker: true,
};
