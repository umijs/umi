export default {
  target: 'node',
  cjs: 'babel',
  browserFiles: [
    'src/webpackHotDevClient.js',
    'src/utils.js',
    'src/formatWebpackMessages.js',
    'src/socket.js',
    'src/patchConnection.js',
  ],
};
