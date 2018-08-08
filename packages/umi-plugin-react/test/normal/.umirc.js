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
        pwa: {},
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './Loading.js',
        },
        library: 'react',

        // misc
        dva: false,
        routes: {
          exclude: [/b\//],
        },
        polyfills: [],
      },
    ],
  ],
};
