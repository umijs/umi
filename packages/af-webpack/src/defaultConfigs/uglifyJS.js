export default {
  compress: {
    screw_ie8: true, // React doesn't support IE8
    warnings: false,
  },
  mangle: {
    screw_ie8: true,
  },
  output: {
    comments: false,
    screw_ie8: true,
    ascii_only: true,
  },
};
