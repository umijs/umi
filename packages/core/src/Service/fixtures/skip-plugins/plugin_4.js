
module.exports = function(api) {
  api.describe({
    id: 'plugin_4',
  });
  api.register({
    key: 'foo',
    fn: () => {},
  });
};
