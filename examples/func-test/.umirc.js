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
  exportStatic: true,
};
