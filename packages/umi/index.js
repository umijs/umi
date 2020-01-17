let exports = require('./lib/cjs');
try {
  const umiExports = require('@@/umiExports');
  exports = Object.assign(exports, umiExports);
} catch (e) {}
module.exports = exports;
