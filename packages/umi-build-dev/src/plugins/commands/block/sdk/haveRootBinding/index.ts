import traverse from '@babel/traverse';
import { parseContent } from '../util';

export default (content, name) => {
  return new Promise(resolve => {
    const ast = parseContent(content);
    traverse(ast, {
      Program(path) {
        resolve(path.scope.hasBinding(name));
      },
    });
  });
};
