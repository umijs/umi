export default {
  target: 'node',
  cjs: { type: 'babel' },
  disableTypeCheck: true,
  browserFiles: ['src/plugins/pwa/registerServiceWorker.js', 'src/plugins/title/TitleWrapper.js'],
};
