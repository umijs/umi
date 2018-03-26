export default {
  pages: {
    '/': { context: { title: '首页' } },
    'list.html': { context: { title: '列表页' } },
  },
  plugins: [
    'umi-plugin-dll',
    './plugin1',
    ['./plugin2', 'hihi'],
    // 'umi-plugin-yunfengdie',
  ],
  hd: 1,
  loading: './PageLoadingComponent',
  // disableServiceWorker: true,
  // exportStatic: {
  //   htmlSuffix: true,
  // },
  outputPath: './www',
};
