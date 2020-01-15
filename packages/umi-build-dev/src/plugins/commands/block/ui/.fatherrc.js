export default {
  entry: 'client/index.tsx',
  file: 'client',
  umd: {
    name: 'blocks',
    minFile: false,
  },
  extraExternals: ['antd', 'react', 'react-dom'],
  typescriptOpts: {
    check: false,
  },
};
