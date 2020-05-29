import { Template } from 'webpack';
const { refreshUtils } = require('../runtime/globals');

const RefreshModuleRuntime = Template.getFunctionContent(
  require('./RefreshModuleRuntime'),
)
  .trim()
  .replace(/^ {2}/gm, '')
  .replace(/\$RefreshUtils\$/g, refreshUtils);

/**
 * A simple Webpack loader to inject react-refresh HMR code into modules.
 *
 * [Reference for Loader API](https://webpack.js.org/api/loaders/)
 * @this {import('webpack').loader.LoaderContext}
 * @param {string} source The original module source code.
 * @param {import('source-map').RawSourceMap} [inputSourceMap] The source map of the module.
 * @returns {void}
 */
function RefreshHotLoader(source, inputSourceMap) {
  // Use callback to allow source maps to pass through
  this.callback(null, `${source}\n\n${RefreshModuleRuntime}`, inputSourceMap);
}

module.exports = RefreshHotLoader;
