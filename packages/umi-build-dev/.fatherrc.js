export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/plugins/404/NotFound.js',
    'src/plugins/404/guessJSFileFromPath.js',
    'src/plugins/commands/ui/src/pages/index/index.js',
    'src/plugins/commands/ui/src/layouts/index.js',
    'src/plugins/commands/ui/plugins/config/client.js',
    'src/plugins/commands/ui/plugins/routes/client.js',
    'src/plugins/commands/ui/plugins/blocks/client.js',
  ],
};
