export default {
  target: 'browser',
  cjs: { type: 'babel', lazy: true },
  esm: { type: 'rollup' },
  disableTypeCheck: false,
  extraExternals: ['@@/umiExports'],
};
