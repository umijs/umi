
module.exports = (api) => {
  api.describe({
    key: 'foo',
    config: {
      schema(joi) {
        return joi.number();
      },
    },
  });
};
