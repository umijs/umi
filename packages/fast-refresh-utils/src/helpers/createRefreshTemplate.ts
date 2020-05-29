const { Template } = require('webpack');

/**
 * Code to run before each module, sets up react-refresh.
 *
 * `module.i` is injected by Webpack and should always exist.
 *
 * [Ref](https://github.com/webpack/webpack/blob/master/lib/MainTemplate.js#L233)
 */
const beforeModule = `
let cleanup = function NoOp() {};

const check = function(it) {
  return it && it.Math == Math && it;
};

const safeThis =
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  Function('return this')();

if (safeThis && safeThis.$RefreshSetup$) {
  cleanup = safeThis.$RefreshSetup$(module.i);
}

try {
`;

/** Code to run after each module, sets up react-refresh */
const afterModule = `
} finally {
  cleanup();
}
`;

/**
 * Creates a module wrapped by a refresh template.
 * @param {string} source The source code of a module.
 * @returns {string} A refresh-wrapped module.
 */
function createRefreshTemplate(source) {
  const lines = source.split('\n');

  // Webpack generates this line whenever the mainTemplate is called
  const moduleInitializationLineNumber = lines.findIndex((line) =>
    line.startsWith('modules[moduleId].call'),
  );

  return Template.asString([
    ...lines.slice(0, moduleInitializationLineNumber),
    beforeModule,
    Template.indent(lines[moduleInitializationLineNumber]),
    afterModule,
    ...lines.slice(moduleInitializationLineNumber + 1, lines.length),
  ]);
}

module.exports = createRefreshTemplate;
