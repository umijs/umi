import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import assert from 'assert';
import prettier from 'prettier';

export default function({ key, value, file, plugin }) {
  let content = `export default {}`;
  if (existsSync(file)) {
    content = readFileSync(file, 'utf-8');
  }
  const newContent = update(content, key, value, plugin);
  writeFileSync(file, `${newContent}\n`, 'utf-8');
}

function buildExpression(keys, str) {
  if (str.startsWith('{') || str.startsWith('[')) {
    // do nothing
  } else if (str === 'true' || str === 'false') {
    // do nothing
  } else {
    str = `'${str}'`;
  }
  let exp = template(`(${str})`, { placeholderPattern: false })().expression;

  let i = 0;
  keys = keys.reverse();
  while (i < keys.length) {
    exp = t.objectExpression([t.objectProperty(t.identifier(keys[i]), exp)]);
    i += 1;
  }

  return exp;
}

function getVariableDeclarator(node, path) {
  if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
    const bindingNode = path.scope.getBinding(node.name).path.node;
    if (t.isVariableDeclarator(bindingNode)) {
      node = bindingNode.init;
    }
  }
  return node;
}

function findPluginConfig(node, path, plugin) {
  let plugins = node.properties.find(p => {
    return t.isIdentifier(p.key) && p.key.name === 'plugins';
  }).value;
  assert(plugins, `plugins is not configured.`);
  plugins = getVariableDeclarator(plugins, path);
  assert(t.isArrayExpression(plugins), `plugins must be array.`);

  for (let [index, el] of plugins.elements.entries()) {
    if (t.isStringLiteral(el) && el.value === plugin) {
      el = template(`(['${plugin}', {}])`)().expression;
      plugins.elements.splice(index, 1, el);
    }
    el = getVariableDeclarator(el, path);
    if (
      t.isArrayExpression(el) &&
      t.isStringLiteral(el.elements[0]) &&
      el.elements[0].value === plugin
    ) {
      if (!el.elements[1]) {
        el.elements.push(template(`({})`)().expression);
      }
      let config = el.elements[1];
      config = getVariableDeclarator(config, path);
      assert(t.isObjectExpression(config), `config for ${plugin} is not object`);
      return config;
    }
  }
}

export function update(content, key, value, plugin) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      let node = path.node.declaration;

      // export default {} as IConfig;
      if (node.type === 'TSAsExpression') {
        node = node.expression;
      }

      // const a;
      // export default a;
      node = getVariableDeclarator(node, path);

      assert(t.isObjectExpression(node), `config file must export default a Plain Object`);
      if (plugin) {
        node = findPluginConfig(node, path, plugin);
      }
      let { properties } = node;

      let obj = key;
      if (typeof key === 'string') {
        obj = {
          [key]: value,
        };
      }

      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const keys = key.split('.');
        let i = 0;
        let ps = properties;
        while (i < keys.length) {
          let hasFound;
          for (const property of ps) {
            if (
              t.isIdentifier(property.key, {
                name: keys[i],
              })
            ) {
              if (i === keys.length - 1 || !t.isObjectExpression(property.value)) {
                property.value = buildExpression(keys.slice(i + 1), value);
                return;
              } else {
                ps = property.value.properties;
              }
              hasFound = true;
              break;
            }
          }
          if (!hasFound) {
            ps.push(
              t.objectProperty(t.identifier(keys[i]), buildExpression(keys.slice(i + 1), value)),
            );
            break;
          } else {
            i += 1;
          }
        }
      });
    },
  });
  const newCode = generate(ast, {}).code;
  return prettier.format(newCode, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'typescript',
  });
}
