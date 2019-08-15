export default {
  plugins: [
    [
      '../../../../../umi-plugin-react/lib/index.js',
      {
        antd: true,
        locale:{
          enable: true,
          baseSeparator: '_',
          baseNavigator: false,
          default: 'en_US',
        },
      }
    ],
  ],
};
