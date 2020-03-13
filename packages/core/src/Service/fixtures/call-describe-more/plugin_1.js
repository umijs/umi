
module.exports = (api) => {
  api.describe({
    key: 'bar',
    id: 'bar',
    config: {
      schema(joi) {
        return joi.number();
      },
    },
  });
  api.describe({
    key: 'foo',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
  });
};
