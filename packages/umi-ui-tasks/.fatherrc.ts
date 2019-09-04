export default [
  {
    target: 'node',
    cjs: { type: 'babel', lazy: true },
    disableTypeCheck: true,
  },
  {
    cjs: 'babel',
    entry: 'ui/index.tsx',
    disableTypeCheck: true,
    umd: {
      name: 'tasks',
      minFile: false,
    },
  },
];
