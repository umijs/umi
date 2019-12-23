
module.exports = (api) => {
  api.registerPlugins([
    { id: 'plugin_4', key: 'plugin4', apply: () => () => {} },
    require.resolve('./plugin_5'),
  ]);
};
