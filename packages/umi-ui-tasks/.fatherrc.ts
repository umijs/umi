export default [
  {
    entry: 'ui/index.tsx',
    typescriptOpts: {
      check: false,
    },
    umd: {
      name: 'tasks',
      minFile: false,
    },
  },
];
