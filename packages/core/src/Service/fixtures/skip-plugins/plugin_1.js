
module.exports = function(api) {
  api.describe({
    id: 'plugin_1',
    key: 'plugin_1',
  });
  api.register({
    key: 'foo',
    fn: () => {},
  });
  api.skipPlugins(['plugin_2']);
};
