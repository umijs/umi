export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  browserFiles: ['src/bubble/socket.js', 'src/bubble/utils.js'],
  disableTypeCheck: true,
};
