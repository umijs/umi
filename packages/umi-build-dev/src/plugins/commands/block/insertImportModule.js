import * as babylon from 'babylon';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import prettier from 'prettier';

export default function(code, { identifier, modulePath }) {
  const ast = babylon.parse(code, { sourceType: 'module', plugins: ['jsx'] });

  traverse(ast, {
    Program(path) {
      const lastImport = path
        .get('body')
        .filter(p => p.isImportDeclaration())
        .pop();

      if (lastImport) {
        lastImport.insertAfter(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(identifier))],
            t.stringLiteral(modulePath),
          ),
        );
      }
    },
  });

  const newCode = prettier.format(generate(ast).code, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'babylon',
  });

  return newCode;
}
