import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import routes from './routes';

export default {
  nodeModulesTransform: { type: 'all' },
  foo: 'bar',
  devServer: {
    port: '9001',
  },
  dynamicImportSyntax: {},
  esbuild: {},
  favicon: 'abc',
  fastRefresh: {},
  runtimeHistory: {},
  singular: true,
  layout: {
    name: '中文标题',
    foo: '1',
    bar: '2',
  },
  webpack5: {},
  workerLoader: {},
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
  antd: { config: {} },

  chainWebpack(memo) {
    memo.plugin('monacoEditorWebpackPlugin').use(MonacoEditorWebpackPlugin, [
      {
        languages: ['typescript', 'javascript', 'sql'],
      },
    ]);
  },
};
