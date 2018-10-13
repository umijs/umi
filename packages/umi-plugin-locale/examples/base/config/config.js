export default {
  plugins: [
    [
      '../../src/index',
      {
        enable: true,
        baseNavigator: false,
        default: 'en-US',
      },
    ],
  ],
  singular: true,
};
