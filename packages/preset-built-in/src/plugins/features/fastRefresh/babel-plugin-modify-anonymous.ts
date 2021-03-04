import { extname } from 'path';

// @ts-ignore
export default (babel) => {
  const { types: t } = babel;
  return {
    visitor: {
      // @ts-ignore
      ExportDefaultDeclaration(path, state) {
        const def = path.node.declaration;
        const named = t.identifier(`Abc1`);
        const { filename } = state.file.opts;
        if (
          /^\.(tsx|jsx)$/.test(extname(filename)) &&
          // hidden filename
          !/(^|\/)\.[^\/\.]/g.test(filename) &&
          !filename.includes('node_modules')
        ) {
          if (t.isArrowFunctionExpression(def)) {
            const varDec = t.variableDeclaration('const', [
              t.variableDeclarator(named, def),
            ]);
            const [varDeclPath] = path.insertBefore(varDec);
            path.scope.registerDeclaration(varDeclPath);
            path.replaceWith(t.exportDefaultDeclaration(named));
          } else if (t.isFunctionDeclaration(def) && !def.id) {
            def.id = named;
          }
        }
      },
    },
  };
};
