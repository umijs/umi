const { version } = require('webpack');

// Parse Webpack's major version: x.y.z => x
const webpackVersion = parseInt(version || '', 10);

let webpackGlobals = {};
if (webpackVersion === 5) {
  webpackGlobals = require('webpack/lib/RuntimeGlobals');
}

module.exports.webpackVersion = webpackVersion;
module.exports.webpackRequire = webpackGlobals.require || '__webpack_require__';
module.exports.refreshGlobal = `${module.exports.webpackRequire}.$Refresh$`;
