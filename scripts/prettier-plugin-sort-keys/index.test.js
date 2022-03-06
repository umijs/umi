const prettier = require('prettier');
const code = `
// sort-object-keys
const foo = { b, a};
`;
const ret = prettier.format(code, {
  parser: 'typescript',
  plugins: [require.resolve('./')]
});
console.log(ret);
