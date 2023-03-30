export default function () {
  let plugins = [require.resolve('./features/socket')];
  return {
    plugins,
  };
}
