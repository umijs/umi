export default {
  plugins: [
    [
      'umi-plugin-locale',
      {
        enable: true,
        baseNavigator: false,
        default: 'en-US',
      },
    ],
  ],
  singular: true,
};
