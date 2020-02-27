
module.exports = (api) => {
  api.describe({
    key: 'bar',
    config: {
      schema(joi) { return joi.object() }
    },
    enableBy: api.EnableBy.config,
  });

  api.register({
    key: 'count',
    fn() { return 'bar' },
  });
};
