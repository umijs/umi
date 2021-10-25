export default () => {
  return {
    plugins: [
      // registerMethods
      require.resolve('./registerMethods'),

      // features
      require.resolve('./features/appData/appData'),
      require.resolve('./features/check/check'),
      require.resolve('./features/configPlugins/configPlugins'),
      require.resolve('./features/tmpFiles/tmpFiles'),

      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/setup'),
      require.resolve('./commands/version'),
      require.resolve('./commands/generate/generate'),
    ],
  };
};
