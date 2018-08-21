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
    ['umi-plugin-react/lib/plugins/title', '默认标题'],
  ],
  mountElementId: 'container',
};
