
module.exports = (api) => {
  api.describe({
    key: 'foo',
    config: {
      schema(joi) {
        return joi.object({
          publicPath: joi.string(),
        });
      },
      default: {
        publicPath: '/',
        bar: 'bar',
      },
      onChange() {
        api.restartDevServer();
      },
    },
  });
};
