export default {
  srcTranspiler: 'swc',
  mfsu: false,
  targets: {
    // chrome 53 is last not support async version
    // https://caniuse.com/async-functions
    chrome: 54,
  },
};
