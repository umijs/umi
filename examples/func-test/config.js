export default {
  spma: 'a111111111111',
  pages: {
    '/index.html': { spmb: 'b2222222222222', context: { title: '首页' } },
    '/list.html': { spmb: 'b3333333333333', context: { title: '列表页' } },
  },
  plugins: ['./plugin', 'umi-plugin-yunfengdie'],
  // disableServiceWorker: true,
};
