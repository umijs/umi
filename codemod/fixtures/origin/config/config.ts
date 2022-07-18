import routes from './routes';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';

export default {
  nodeModulesTransform: { type: 'all' },
  // deployMode: 'sofa',
  // appType: 'h5',
  foo: 'bar',
  browserUpdate: {},
  cnzz: {
    src: 'https://s19.cnzz.com/z_stat.php?id=1274488723&web_id=1274488723',
  },
  deer: {},
  devServer: {
    port: '9001',
  },
  dynamicImportSyntax: {},
  esbuild: {},
  favicon: 'abc',
  fastRefresh: {},
  must: {},
  // onex: {},
  runtimeHistory: {},
  singular: true,
  layout: {
    name: '中文标题',
    foo: '1',
    bar: '2',
  },
  webpack5: {},
  workerLoader: {},
  bigfly: {},
  devtool: 'eval-cheap-module-source-map',
  proxy: {
    '/empty': {},
    '/api': { target: 'xxx' },
  },
  routes,
  dynamicImport: { loading: './Loading.tsx' },
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },
  exportStatic: { htmlSuffix: true },
  monacoEditor: {
    languages: ['cpp', 'json', 'mysql', 'python'],
  },
  // mpa: {},
  // ssr: {
  //   // 更多配置
  //   // forceInitial: false,
  //   // removeWindowInitialProps: false
  //   // devServerRender: true,
  //   // mode: 'string',
  //   // staticMarkup: false,
  // },
  runtimePublicPath: true,
  ctoken: true,
  antd: { config: {} },

  chainWebpack(memo) {
    memo.plugin('monacoEditorWebpackPlugin').use(MonacoEditorWebpackPlugin, [
      {
        languages: ['typescript', 'javascript', 'sql'],
      },
    ]);
  },
};
