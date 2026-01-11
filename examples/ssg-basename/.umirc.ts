export default {
  exportStatic: {},
  ssr: {},
  base: '/base/',
  publicPath: '/base/', // 布署时需要布署在 base 文件夹下.
  metas: [
    {
      property: 'og:image',
      content: 'https://example.com/example.png',
    },
  ],
};
