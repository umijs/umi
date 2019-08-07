export default function(api) {
  api.addUIPlugin(require.resolve('../../../src/plugins/tasks/dist/ui.umd'));

  api.onUISocket(({ action: { type, payload }, send, log }) => {
    switch (type) {
      default:
        break;
    }
  });
}
