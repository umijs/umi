export default {
  plugins: [
    '@umijs/plugins/dist/valtio',
    '@umijs/plugins/dist/styled-components',
    '@umijs/plugins/dist/react-query',
  ],
  base: '/__umi_ui/',
  publicPath: '/__umi_ui/',
  styledComponents: {},
  reactQuery: {},
  valtio: {},

  icons: {
    autoInstall: {},
    include: [
      'ant-design:fund-projection-screen-outlined',
      'ant-design:control-outlined',
      'ant-design:cluster-outlined',
      'ant-design:medicine-box-outlined',
      'ant-design:api-outlined',
      'ant-design:right-square-outlined',
      'ant-design:bars-outlined',
      'ant-design:pie-chart-outlined',
    ],
  },
};
