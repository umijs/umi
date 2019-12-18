
module.exports = function(api) {
  return {
    presets: [
      require.resolve('./preset_1'),
    ],
    plugins: [
      require.resolve('./plugin_1'),
      require.resolve('./plugin_2'),
    ],
  };
};
