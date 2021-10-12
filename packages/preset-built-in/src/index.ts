export default () => {
  return {
    plugins: [
      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/version'),
    ],
  };
};
