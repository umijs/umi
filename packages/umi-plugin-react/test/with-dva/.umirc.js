export default {
  mountElementId: 'container',
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
