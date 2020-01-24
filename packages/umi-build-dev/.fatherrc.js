export default [
  {
    target: 'node',
    cjs: { type: 'babel', lazy: true },
    disableTypeCheck: true,
    browserFiles: [
      'src/findRoute.js',
      'src/plugins/404/NotFound.js',
      'src/plugins/404/guessJSFileFromPath.js',
      'src/plugins/commands/dev/injectUI.js',
      'src/plugins/commands/block/sdk/flagBabelPlugin/GUmiUIFlag.tsx',
    ],
  },
  {
    entry: 'src/plugins/commands/block/ui/client/index.tsx',
    file: 'client',
    umd: {
      name: 'blocks',
      minFile: false,
      globals: {
        antd: 'window.antd',
        react: 'window.React',
        'react-dom': 'window.ReactDOM',
      },
    },
    extraExternals: ['antd', 'react', 'react-dom'],
    typescriptOpts: {
      check: false,
    },
  },
];
