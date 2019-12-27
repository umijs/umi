
module.exports = (api) => {
  api.registerCommand({
    name: 'foo',
    async fn() {
      await api.applyPlugins({
        key: 'onTestFoo',
        type: 'event',
      });
    },
  });

  api.registerMethod({ name: 'onTestFoo' });

  api.onTestFoo(() => {
    api.writeTmpFile({
      path: 'foo',
      content: 'foo',
    });
  });
}
