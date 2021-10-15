export default () => {
  return {
    plugins: [
      // registerMethods
      require.resolve('./registerMethods'),

      // features
      require.resolve('./features/tmpFiles/tmpFiles'),
      require.resolve('./features/configPlugins/configPlugins'),

      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/version'),
    ],
  };
};
