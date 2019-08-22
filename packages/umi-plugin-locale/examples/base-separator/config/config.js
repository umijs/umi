export default {
  plugins: [
    [
      '../../../lib/index.js',
      {
        enable: true,
        baseNavigator: false,
        baseSeparator: '_',
        default: 'en_US',
      },
    ],
  ],
};
