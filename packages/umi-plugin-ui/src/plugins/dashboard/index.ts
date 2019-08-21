export default api => {
  api.addUIPlugin(require.resolve('../../../src/plugins/dashboard/dist/ui.umd'));

  // api.onUISocket(({ action: { type, payload }, send, log }) => {
  //   switch (type) {
  //     default:
  //       break;
  //   }
  // });
};
