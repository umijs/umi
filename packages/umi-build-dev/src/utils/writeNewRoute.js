import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parseModule, parse } from 'esprima';
import escodegen from 'escodegen';

function getPropertyFromDefault(ast, name) {
  const defaultNode = ast.body.find(item => {
    return item.type === 'ExportDefaultDeclaration';
  });
  if (!name) {
    return {
      node: defaultNode,
      key: 'declaration',
    };
  }
  if (defaultNode.declaration.type === 'ObjectExpression') {
    const routesNode = defaultNode.declaration.properties.find(item => {
      return item.type === 'Property' && item.key.name === 'routes';
    });
    return {
      node: routesNode,
      key: 'value',
    };
  }
  return null;
}

// a demo ast for getRealRoutesPath like this:
// {
//   "type": "Program",
//   "body": [
//     {
//       "type": "ImportDeclaration",
//       "specifiers": [
//         {
//           "type": "ImportDefaultSpecifier",
//           "local": { "type": "Identifier", "name": "pageRoutes" }
//         }
//       ],
//       "source": {
//         "type": "Literal",
//         "value": "./router.config",
//         "raw": "'./router.config'"
//       }
//     },
//     {
//       "type": "ExportDefaultDeclaration",
//       "declaration": {
//         "type": "ObjectExpression",
//         "properties": [
//           {
//             "type": "Property",
//             "key": { "type": "Identifier", "name": "routes" },
//             "computed": false,
//             "value": { "type": "Identifier", "name": "pageRoutes" },
//             "kind": "init",
//             "method": false,
//             "shorthand": false
//           }
//         ]
//       }
//     }
//   ],
//   "sourceType": "module"
// }
export function getRealRoutesPath(configPath, srcPath) {
  const configContent = readFileSync(configPath, 'utf-8');
  const ast = parseModule(configContent);
  const { node, key } = getPropertyFromDefault(ast, 'routes');
  if (node && node[key].type === 'Identifier') {
    // lik: routes: pageRoutes,
    const routesIdentifier = node[key].name;
    // find routesIdentifier defined in which module
    let modulePath;
    ast.body.find(item => {
      if (item.type === 'ImportDeclaration') {
        const routerSpecifie = item.specifiers.find(s => {
          return (
            s.type === 'ImportDefaultSpecifier' &&
            s.local.name === routesIdentifier
          );
        });
        if (routerSpecifie) {
          modulePath = item.source.value;
          return true;
        }
      }
      return false;
    });
    if (modulePath) {
      // like @/route.config
      if (/^@\//.test(modulePath)) {
        modulePath = join(srcPath, modulePath.replace(/^@\//, ''));
      } else {
        modulePath = join(dirname(configPath), modulePath);
      }
      if (!/\.js$/.test(modulePath)) {
        modulePath = `${modulePath}.js`;
      }
      if (existsSync(modulePath)) {
        return {
          realPath: modulePath,
          routesProperty: null,
        };
      }
    }
  }
  return {
    realPath: configPath,
    routesProperty: 'routes',
  };
}

export function insertRouteContent(content, routeName, routesProperty) {
  const ast = parseModule(content, {
    attachComment: true,
  });
  const { node, key } = getPropertyFromDefault(ast, routesProperty);
  if (node) {
    const newObj = parse(
      `const temp = { path: '/${routeName}', component: './${routeName}' }`,
    ).body[0].declarations[0].init;
    if (node[key].type !== 'ArrayExpression') {
      // routes not a raw array, parse to a array
      // eg: routes: routes, => routes: [...routes]
      const oldValue = node[key];
      node[key] = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: oldValue,
          },
        ],
      };
    }
    node[key].elements.unshift(newObj);
  } else {
    return content;
  }
  const newCode = escodegen.generate(ast, {
    format: {
      indent: {
        style: '  ',
      },
    },
    comment: true,
  });
  return `${newCode}\n`;
}

export default function writeNewRoute(name, configPath, srcPath) {
  const { realPath, routesProperty } = getRealRoutesPath(configPath, srcPath);
  const routesContent = readFileSync(realPath, 'utf-8');
  writeFileSync(
    realPath,
    insertRouteContent(routesContent, name, routesProperty),
    'utf-8',
  );
}
