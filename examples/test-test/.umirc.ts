export default {
  npmClient: 'pnpm',
  plugins: ['@umijs/plugins/dist/dva', '@umijs/plugins/dist/request'],
  dva: {
    immer: {
      enableES5: true,
      enableAllPlugins: true,
    },
  },
  request: {},
};
