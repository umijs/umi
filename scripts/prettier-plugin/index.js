const { parsers } = require('prettier-plugin-organize-imports');

function createParser(original, transform) {
  return {
    ...original,
    parse: (text, parsers, options) => {
      const ast = original.parse(text, parsers, options);
      transform(ast, { ...options, text });
      return ast;
    }
  }
}

// https://lihautan.com/manipulating-ast-with-javascript/
function visit(ast, callbackMap) {
  function _visit(node, parent, key, index) {
    if (typeof callbackMap === 'function') {
      if (callbackMap(node, parent, key, index) === false) {
        return
      }
    } else if (node.type in callbackMap) {
      if (callbackMap[node.type](node, parent, key, index) === false) {
        return
      }
    }

    const keys = Object.keys(node)
    for (let i = 0; i < keys.length; i++) {
      const child = node[keys[i]]
      if (Array.isArray(child)) {
        for (let j = 0; j < child.length; j++) {
          if (child[j] !== null) {
            _visit(child[j], node, keys[i], j)
          }
        }
      } else if (typeof child?.type === 'string') {
        _visit(child, node, keys[i], i)
      }
    }
  }
  _visit(ast)
}

function transformJavaScript(ast, options) {
  if (!options.text.includes('// sort-object-keys')) return;
  visit(ast, {
    ObjectExpression(node) {
      const { properties } = node;
      properties.sort((a, b) => {
        const { key: aKey } = a;
        const { key: bKey } = b;
        if (aKey.type === 'Identifier' && bKey.type === 'Identifier') {
          return aKey.name.localeCompare(bKey.name);
        }
        return 0;
      });
    },
    TSTypeLiteral(node) {
      const { members } = node;
      members.sort((a, b) => {
        const { key: aKey } = a;
        const { key: bKey } = b;
        if (aKey.type === 'Identifier' && bKey.type === 'Identifier') {
          return aKey.name.localeCompare(bKey.name);
        }
        return 0;
      });
    }
  })
}

exports.parsers = {
  ...parsers,
  typescript: createParser(parsers.typescript, transformJavaScript),
};
