export default {
  entry: 'ui.tsx',
  umd: {
    name: 'tasks',
    minFile: false,
  },
  extraExternals: ['antd', 'react', 'react-dom', 'xterm'],
  typescriptOpts: {
    check: false,
    globals: {
      antd: 'window.antd',
      react: 'window.React',
      'react-dom': 'window.ReactDOM',
    },
  },
};
