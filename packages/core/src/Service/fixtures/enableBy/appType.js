
module.exports = (api) => {
  api.describe({
    key: 'appType',
    config: {
      schema(joi) { return joi.string(); }
    }
  });
};
