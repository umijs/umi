
module.exports = {
  entry() {
    return require('fork-ts-checker-webpack-plugin');
  },
  TypeScriptReporterRpcService() {
    return require('fork-ts-checker-webpack-plugin/lib/typescript-reporter/reporter/TypeScriptReporterRpcService');
  },
  EsLintReporterRpcService() {
    return require('fork-ts-checker-webpack-plugin/lib/eslint-reporter/reporter/EsLintReporterRpcService');
  }
}
