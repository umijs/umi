export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/findRoute.js',
    'src/plugins/404/NotFound.js',
    'src/plugins/404/guessJSFileFromPath.js',
    'src/plugins/commands/dev/injectUI.js',
  ],
};
