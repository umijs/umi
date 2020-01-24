export default [
  {
    target: 'node',
    cjs: { type: 'babel', lazy: true },
    disableTypeCheck: true,
    browserFiles: ['src/plugins/pwa/registerServiceWorker.js', 'src/plugins/title/TitleWrapper.js'],
  },
  {
    entry: 'ui/index.js',
    typescriptOpts: {
      check: false,
    },
    extraExternals: ['antd', 'react', 'react-dom'],
    umd: {
      name: 'umi-plugin-react',
      minFile: false,
      globals: {
        antd: 'window.antd',
        react: 'window.React',
        'react-dom': 'window.ReactDOM',
      },
    },
  },
];
