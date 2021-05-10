import template from '../compiled/babel/template';
import generate from '../compiled/babel/generator';
import * as t from '../compiled/babel/types';

test('@babel/template + @babel/generator', () => {
  const buildRequire = template(`
  var %%importName%% = require(%%source%%);
`);
  const ast = buildRequire({
    importName: t.identifier('myModule'),
    source: t.stringLiteral('my-module'),
  });
  expect(generate(ast as any).code).toEqual(
    'var myModule = require("my-module");',
  );
});
