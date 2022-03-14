const prettier = require('prettier');
const code = `
import 'b';
import 'a';
// sort-object-keys
const foo = { b, a};
`;
const ret = prettier.format(code, {
  parser: 'typescript',
  plugins: [require.resolve('./')]
});
console.log(ret);
