import { readFileSync, writeFileSync } from 'fs';
import { parseModule, parse } from 'esprima';
import escodegen from 'escodegen';

export function getRealRoutesPath(configPath) {
  // TODO update routes in routes file directly, like router.config.js in antd pro
  return configPath;
}

export function insertRouteContent(content, routeName) {
  const ast = parseModule(content, {
    range: true,
    tokens: true,
    comment: true,
  });
  const routesDefine = ast.body
    .find(item => {
      return item.type === 'ExportDefaultDeclaration';
    })
    .declaration.properties.find(item => {
      return item.type === 'Property' && item.key.name === 'routes';
    });
  if (routesDefine) {
    const newObj = parse(
      `const temp = { path: '/${routeName}', component: './${routeName}' }`,
    ).body[0].declarations[0].init;
    if (routesDefine.value.type !== 'ArrayExpression') {
      // routes not a raw array, parse to a array
      // eg: routes: routes, => routes: [...routes]
      const oldValue = routesDefine.value;
      routesDefine.value = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: oldValue,
          },
        ],
      };
    }
    routesDefine.value.elements.unshift(newObj);
  } else {
    return content;
  }
  const newCode = escodegen.generate(
    escodegen.attachComments(ast, ast.comments, ast.tokens),
    {
      format: {
        indent: {
          style: '  ',
        },
      },
      comment: true,
    },
  );
  return `${newCode}\n`;
}

export default function writeNewRoute(name, configPath, srcPath) {
  const realPath = getRealRoutesPath(configPath, srcPath);
  const routesContent = readFileSync(realPath, 'utf-8');
  writeFileSync(realPath, insertRouteContent(routesContent, name), 'utf-8');
}
