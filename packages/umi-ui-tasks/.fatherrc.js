export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  browserFiles: ['src/ui/index.js'],
};
