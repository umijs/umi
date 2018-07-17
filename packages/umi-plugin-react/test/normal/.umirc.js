export default {
  plugins: [
    [
      '../../lib',
      {
        // mobile
        hd: true,
        fastClick: true,

        // dev boost
        dll: false,
        hardSource: false,

        // performace
        serviceWorker: false,
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './Loading.js',
        },
        library: 'react',

        // misc
        dva: false, //{ immer: true },
        polyfills: [],
      },
    ],
  ],
};
