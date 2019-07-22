export default {
  target: 'node',
  cjs: { type: 'babel' },
  browserFiles: [
    'src/plugins/configuration/client.js',
    'src/plugins/routes/client.js',
    'src/plugins/blocks/client.js',
  ],
  disableTypeCheck: true,
};
