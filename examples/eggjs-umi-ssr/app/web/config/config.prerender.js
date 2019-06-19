export default {
  hash: true,
  plugins: [
    [
      'umi-plugin-react',
      {
        hd: true,
        antd: true,
        dynamicImport: {
          webpackChunkName: true,
        },
      },
    ],
    ['umi-plugin-prerender'],
  ],
};
