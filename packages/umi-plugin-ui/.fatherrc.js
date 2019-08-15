export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/plugins/dashboard/ui.js',
    'src/plugins/configuration/ui/index.tsx',
    'src/plugins/routes/ui.js',
    'src/plugins/blocks/ui.tsx',
    'src/plugins/tasks/ui.js',
  ],
  disableTypeCheck: true,
};
