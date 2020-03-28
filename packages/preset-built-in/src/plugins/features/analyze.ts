import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'analyze',
    config: {
      schema(joi) {
        return joi
          .object({
            analyzerMode: joi.string().valid('server', 'static', 'disabled'),
            analyzerHost: joi.string(),
            analyzerPort: joi.alternatives(joi.number(), 'auto'),
            openAnalyzer: joi.boolean(),
            generateStatsFile: joi.boolean(),
            statsFilename: joi.string(),
            logLevel: joi.string().valid('info', 'warn', 'error', 'silent'),
            defaultSizes: joi.string().valid('stat', 'parsed', 'gzip'),
          })
          .unknown(true);
      },
      default: {
        analyzerMode: process.env.ANALYZE_MODE || 'server',
        analyzerPort: process.env.ANALYZE_PORT || 8888,
        openAnalyzer: process.env.ANALYZE_OPEN !== 'none',
        // generate stats file while ANALYZE_DUMP exist
        generateStatsFile: !!process.env.ANALYZE_DUMP,
        statsFilename: process.env.ANALYZE_DUMP || 'stats.json',
        logLevel: process.env.ANALYZE_LOG_LEVEL || 'info',
        defaultSizes: 'parsed', // stat  // gzip
      },
    },
    enableBy: () => {
      const ssr = api.config?.ssr;
      return !!(
        (process.env.ANALYZE && !ssr) ||
        (process.env.ANALYZE_SSR && ssr)
      );
    },
  });
  api.chainWebpack((webpackConfig) => {
    webpackConfig
      .plugin('bundle-analyzer')
      .use(require('umi-webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        api.config?.analyze || {},
      ]);
    return webpackConfig;
  });
};
