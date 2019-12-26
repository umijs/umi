export default function() {
  return {
    plugins: [
      require.resolve('./core/registerMethods'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/build/build'),
    ],
  };
}
