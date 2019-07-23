export default api => {
  api.addUIPlugin(require.resolve('./plugins/blocks/dist/ui.umd'));
  require('./plugins/blocks/index').default(api);
};
