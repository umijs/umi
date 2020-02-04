import { isPlainObject, isEmpty } from 'lodash';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import portfinder from 'portfinder';
import mkdirp from 'mkdirp';

interface IGetAnalyzeEnvOpts {
  analyze: boolean;
  dbPath: string;
  fileName: string;
}

const getAvailablePort = async () => {
  portfinder.basePort = 8888;
  portfinder.highestPort = 9999;

  return await portfinder.getPortPromise();
};

export const getDevAnalyzeEnv = async () => {
  try {
    const port = await getAvailablePort();
    return {
      ANALYZE: '1',
      ANALYZE_MODE: 'server',
      ANALYZE_OPEN: 'none',
      ANALYZE_LOG_LEVEL: 'silent',
      ANALYZE_PORT: port,
    };
  } catch (_) {
    return {};
  }
};

export const getBuildAnalyzeEnv = async ({ analyze, dbPath, fileName }: IGetAnalyzeEnvOpts) => {
  if (!analyze) {
    return {};
  }

  // 创建 db 目录
  try {
    mkdirp.sync(dbPath);

    const analyzeStatsPath = join(dbPath, fileName);
    return {
      ANALYZE: '1',
      ANALYZE_MODE: 'disabled', // 不启动分析服务
      ANALYZE_DUMP: analyzeStatsPath, // 只将 stats 写入指定地址
      ANALYZE_LOG_LEVEL: 'silent',
    };
  } catch (_) {
    console.log(_.stack);
    return {};
  }
};

export function parseChartData(stats) {
  if (!stats) {
    return null;
  }
  let chartData;
  const analyzer = require('umi-webpack-bundle-analyzer/lib/analyzer');

  try {
    /**
     * outputPath:
     *  1. build: stats.outputPath
     *  2. dev: null
     */
    chartData = analyzer.getViewerData(stats, stats.outputPath, {
      excludeAssets: null,
    });
  } catch (err) {
    chartData = null;
  }

  if (isPlainObject(chartData) && isEmpty(chartData)) {
    chartData = null;
  }

  return chartData;
}

export const getChartData = (statsPath: string) => {
  if (!statsPath) {
    return null;
  }
  if (!existsSync(statsPath)) {
    return null;
  }

  let stats;
  try {
    stats = JSON.parse(
      readFileSync(statsPath, {
        encoding: 'utf8',
      }),
    );
  } catch (_) {
    return null;
  }
  return parseChartData(stats);
};
