export default {
  legacy: {
    checkOutput: true,
  },
  externals: {
    lodash: [
      'script https://gw.alipayobjects.com/os/lib/lodash/4.17.21/lodash.min.js',
      '_',
    ],
  },
};
