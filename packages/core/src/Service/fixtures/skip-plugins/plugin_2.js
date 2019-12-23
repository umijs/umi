
module.exports = function(api) {
  api.describe({
    id: 'plugin_2',
  });
  api.register({
    key: 'foo',
    fn: () => {},
  });
};
