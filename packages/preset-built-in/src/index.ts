export default function() {
  return {
    presets: [
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/build/build'),
    ],
  };
}
