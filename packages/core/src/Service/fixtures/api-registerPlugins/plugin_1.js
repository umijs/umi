
module.exports = (api) => {
  api.registerPlugins([
    { id: 'plugin_2', key: 'plugin2', apply: () => () => {} },
    require.resolve('./plugin_3'),
  ]);
};
