export default {
  plugins: [
    [
      '../../lib',
      {
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './Loading.js',
        },
        dva: { immer: true },
      },
    ],
  ],
};
