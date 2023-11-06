export default () => {
  return {
    plugins: [
      require.resolve('./features/appData'),
      require.resolve('./features/eat'),
    ],
  };
};
