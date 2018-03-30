export default {
  pages: {
    '/': { context: { title: '首页' } },
    '/list': { document: 'pages/list.ejs', context: { title: '列表页' } },
    '/404': { document: 'pages/404.ejs' },
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
  exportStatic: {
    // htmlSuffix: true,
  },
  disableDynamicImport: true,
  outputPath: './www',
};
