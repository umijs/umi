export default function() {
  return {
    plugins: [
      // register methods
      require.resolve('./registerMethods'),

      // generate files
      require.resolve('./generateFiles/core/history'),
      require.resolve('./generateFiles/core/plugin'),
      require.resolve('./generateFiles/core/routes'),
      require.resolve('./generateFiles/core/umiExports'),
      require.resolve('./generateFiles/umi'),

      // commands
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/build/build'),
    ],
  };
}
