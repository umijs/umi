export default {
  favicons: [
    'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  ],
  mfsu: { strategy: 'normal' },
  routePrefetch: {},
  manifest: {},
  plugins: ['@umijs/plugin-docs'],
  conventionRoutes: {
    exclude: [/\/components\//],
  },
};
