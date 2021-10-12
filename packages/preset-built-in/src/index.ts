export default () => {
  return {
    plugins: [
      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/version'),
    ],
  };
};
