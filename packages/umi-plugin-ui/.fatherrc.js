export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/plugins/configuration/ui.js',
    'src/plugins/routes/ui.js',
    'src/plugins/blocks/ui.tsx',
    'src/plugins/tasks/ui.js',
  ],
  disableTypeCheck: true,
};
