export default {
  plugins: [
    [
      '../../../../../umi-plugin-react/lib/index.js',
      {
        antd: true,
        locale:{
          enable: true,
          baseNavigator: false,
          default: 'en-US',
        },
      }
    ],
  ],
  singular: true,
};
