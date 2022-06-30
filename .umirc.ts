export default {
  favicons: [
    'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  ],
  mfsu: false,
  routePrefetch: {},
  manifest: {},
  plugins: ['./packages/plugin-docs'],
  conventionRoutes: {
    exclude: [/\/components\//],
  },
};
