export default {
  entry: 'ui.tsx',
  cssModules: true,
  typescriptOpts: {
    check: false,
  },
  umd: {
    name: 'configuration',
    minFile: false,
  },
};
