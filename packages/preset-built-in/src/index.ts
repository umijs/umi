export default function() {
  return {
    plugins: [
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/build/build'),
    ],
  };
}
