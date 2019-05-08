export default {
  plugins: [
    [
      '../../../lib/index.js',
      {
        enable: true,
        baseNavigator: false,
        default: 'en-US',
      },
    ],
  ],
  singular: true,
};
