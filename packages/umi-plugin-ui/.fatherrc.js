export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/plugins/dashboard/ui.js',
    'src/plugins/configuration/ui.js',
    'src/plugins/routes/ui.js',
    'src/plugins/blocks/ui.tsx',
  ],
  disableTypeCheck: true,
};
