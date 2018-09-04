export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dynamicImport: {
          webpackChunkName: true,
        },
        title: '默认标题',
      },
    ],
  ],
  exportStatic: true,
};
