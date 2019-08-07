export default function(api) {
  api.addUIPlugin(require.resolve('./dist/ui.umd'));

  api.onUISocket(({ action: { type, payload }, send, log }) => {
    switch (type) {
      default:
        break;
    }
  });
}
