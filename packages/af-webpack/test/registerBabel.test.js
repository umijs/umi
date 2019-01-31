import registerBabel from '../src/registerBabel';
import { transform } from '@babel/core';

test('build', () => {
  registerBabel({});
  const source = './fix1.js';
  const code = `import something from "${source}";`;
  const result = transform(code, {});
  // console.log(code)
  // console.dir(result)
  expect(result.options.root != undefined).toBe(true);
});
