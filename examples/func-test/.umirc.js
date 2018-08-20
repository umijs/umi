export default {
  plugins: [
    'umi-plugin-react/lib/plugins/antd',
    './plugins/render-wrapper',
    [
      'umi-plugin-react/lib/plugins/dynamicImport',
      {
        webpackChunkName: true,
      },
    ],
  ],
  mountElementId: 'container',
};
