export default {
  legacy: {
    checkOutput: true,
  },
  utoopack: {},
  externals: {
    lodash: [
      'script https://gw.alipayobjects.com/os/lib/lodash/4.17.21/lodash.min.js',
      '_',
    ],
    jszip: [
      'script https://gw.alipayobjects.com/os/lib/jszip/3.10.1/dist/jszip.min.js',
      'JSZip',
    ],
    'promise-external':
      'promise Promise.resolve({ default: "from-promise-external" })',
  },
};
