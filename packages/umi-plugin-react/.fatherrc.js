export default {
  target: 'node',
  cjs: 'babel',
  disableTypeCheck: true,
  browserFiles: ['src/plugins/pwa/registerServiceWorker.js', 'src/plugins/title/TitleWrapper.js'],
};
