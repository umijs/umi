export default {
  entry: [
    // For react <= 17
    './src/index.ts',
    // For react 18
    './src/index18.ts',
  ],
  target: 'browser',
  cjs: { type: 'rollup', lazy: false },
  esm: { type: 'rollup' },
  disableTypeCheck: false,
};
