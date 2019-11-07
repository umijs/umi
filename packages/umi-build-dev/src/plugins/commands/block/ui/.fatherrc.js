export default {
  entry: 'client/index.tsx',
  file: 'client',
  umd: {
    name: 'blocks',
    minFile: false,
  },
  typescriptOpts: {
    check: false,
  },
};
