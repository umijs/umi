export default {
  routes: [{ path: '/', component: 'index' }],
  plugins: ['@umijs/plugins/dist/dva'],
  dva: {
    immer: {
      enableES5: true,
      enableAllPlugins: true,
    },
  },
};
