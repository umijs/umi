import { extname } from 'path';

// @ts-ignore
export default (babel) => {
  const { types: t } = babel;
  return {
    visitor: {
      // @ts-ignore
      ExportDefaultDeclaration(path, state) {
        const def = path.node.declaration;
        const named = t.identifier(`Abc${Math.floor(Math.random() * 100)}`);
        const { filename } = state.file.opts;
        if (
          /^\.(tsx|jsx)$/.test(extname(filename)) &&
          // hidden filename
          !/(^|\/)\.[^\/\.]/g.test(filename) &&
          !filename.includes('node_modules')
        ) {
          console.log('filename', filename);
          if (t.isArrowFunctionExpression(def)) {
            const varDec = t.variableDeclaration('const', [
              t.variableDeclarator(named, def),
            ]);
            path.insertBefore(varDec);
            const [varDeclPath] = path.replaceWith(
              t.exportDefaultDeclaration(named),
            );
            path.scope.registerDeclaration(varDeclPath);
          } else if (t.isFunctionDeclaration(def) && !def.id) {
            def.id = named;
          }
        }
      },
    },
  };
};
