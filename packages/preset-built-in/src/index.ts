export default () => {
  return {
    plugins: [
      // commands
      require.resolve('./commands/help'),
      require.resolve('./commands/version'),
    ],
  };
};
