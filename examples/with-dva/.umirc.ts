export default {
  plugins: ['@umijs/plugins/dist/dva'],
  dva: {
    immer: {
      enableES5: true,
      enableAllPlugins: true,
    },
  },
};
