export default {
  npmClient: 'pnpm',
  plugins: ['@umijs/plugins/dist/dva'],
  dva: {
    immer: {
      enableES5: true,
      enableAllPlugins: true,
    },
  },
};
