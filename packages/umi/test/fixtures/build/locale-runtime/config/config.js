export default {
  plugins: [
    [
      '../../../../../umi-plugin-locale/lib/index.js',
      {
        enable: true,
        baseNavigator: false,
        default: 'en-US',
        antd: false,
      },
    ],
  ],
  singular: true,
};
