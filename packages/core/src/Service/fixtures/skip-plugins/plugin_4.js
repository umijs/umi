
module.exports = function(api) {
  api.describe({
    id: 'plugin_4',
  });

  // register 后才会存在于 hooks 中
  api.register({
    key: 'foo',
    fn: () => {},
  });
};
