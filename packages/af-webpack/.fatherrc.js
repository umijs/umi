export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/webpackHotDevClient.js',
    'src/utils.js',
    'src/formatWebpackMessages.js',
    'src/socket.js',
    'src/patchConnection.js',
  ],
};
