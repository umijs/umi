export default api => {
  api.addUIPlugin(require.resolve('../../../src/plugins/dashboard/dist/ui.umd'));
};
