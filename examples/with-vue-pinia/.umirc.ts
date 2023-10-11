export default {
  deadCode: {},
  npmClient: 'pnpm',
  crossorigin: {},
  presets: [require.resolve('@umijs/preset-vue')],
  // polyfill: false,
  targets: {
    chrome: 49,
  },
  vite: {},
  viteLegacy: {
    renderModernChunks: true,
  },
};
