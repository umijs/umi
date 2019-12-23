
module.exports = function(api) {
  api.describe({
    id: 'plugin_3',
  });
  api.register({
    key: 'foo',
    fn: () => {},
  });
};
