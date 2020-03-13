export default {
  cjs: { type: 'babel', lazy: true },
  esm: { type: 'rollup' },
  disableTypeCheck: false,
  extraExternals: ['@@/core/umiExports'],
};
