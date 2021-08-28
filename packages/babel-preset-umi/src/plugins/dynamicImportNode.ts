import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import template from '@umijs/bundler-utils/compiled/babel/template';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

function getImportSource(callNode: t.Node) {
  // @ts-ignore
  const importArguments = callNode.arguments;
  const [importPath] = importArguments;

  const isString =
    t.isStringLiteral(importPath) || t.isTemplateLiteral(importPath);
  if (isString) {
    t.removeComments(importPath);
    return importPath;
  }

  return t.templateLiteral(
    [
      t.templateElement({ raw: '', cooked: '' }),
      t.templateElement({ raw: '', cooked: '' }, true),
    ],
    importArguments,
  );
}

const builders = {
  static: template('Promise.resolve().then(() => INTEROP(require(SOURCE)))'),
  dynamic: template('Promise.resolve(SOURCE).then(s => INTEROP(require(s)))'),
};

function isString(node: t.Node) {
  return (
    t.isStringLiteral(node) ||
    (t.isTemplateLiteral(node) && node.expressions.length === 0)
  );
}

export default (): Babel.PluginObj => {
  const visited = new WeakSet();
  return {
    visitor: {
      Import(path: Babel.NodePath<t.Import>) {
        if (visited) {
          if (visited.has(path)) {
            return;
          }
          visited.add(path);
        }

        const SOURCE = getImportSource(path.parent);
        const builder = isString(SOURCE) ? builders.static : builders.dynamic;
        const newImport = builder({
          SOURCE,
          INTEROP: path.hub.addHelper('interopRequireWildcard'),
        });
        // @ts-ignore
        path.parentPath.replaceWith(newImport);
      },
    },
  };
};
