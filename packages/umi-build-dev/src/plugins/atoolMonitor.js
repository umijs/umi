const { join } = require('path');
const { reportData, reportBuildData } = require('atool-monitor');

export default function(api, opts = {}) {
  const umiVersion = require(require.resolve('umi/package.json')).version;
  //  上报 app + dev 数据
  api.onDevCompileDone(({ isFirstCompile, stats }) => {
    if (isFirstCompile && process.env.REPEAT_REPORT !== 'none') {
      // 只在 dev 的第一次编译上报数据 + 避免重复上报
      // 以 umi 为底层工具的框架上报数据后，umi 这边不再上报
      const appData = {
        reportFrom: 'umi',
        umiVersion,
        antdVersion: require(join(
          api.webpackConfig.resolve.alias.antd,
          'package.json',
        )).version,
      };
      const devData = {
        reportFrom: 'umi',
        umiVersion,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          UMI_ENV: process.env.UMI_ENV,
        },
        status: stats.hasErrors() ? 'fail' : 'success',
        startTime: stats.startTime,
        endTime: stats.endTime,
      };
      reportData({ appData, devData });
    }
  });

  // build 成功上报数据
  api.onBuildSuccess(({ stats }) => {
    if (process.env.REPEAT_REPORT !== 'none') {
      // 以 umi 为底层工具的框架上报数据后，umi 这边不再上报
      const buildData = {
        reportFrom: 'umi',
        umiVersion,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          UMI_ENV: process.env.UMI_ENV,
        },
        status: 'success',
        exception: '',
        errorName: '',
        startTime: stats.startTime,
        endTime: stats.endTime,
      };
      reportBuildData({ buildData });
    }
  });

  // build 失败上报数据
  api.onBuildFail(({ err, stats }) => {
    if (process.env.REPEAT_REPORT !== 'none') {
      // 以 umi 为底层工具的框架上报数据后，umi 这边不再上报
      const buildData = {
        reportFrom: 'umi',
        umiVersion,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          UMI_ENV: process.env.UMI_ENV,
        },
        status: 'fail',
        exception: err instanceof Error ? err.stack : '',
        errorName: err instanceof Error ? err.name : '',
        startTime: stats.startTime,
        endTime: stats.endTime,
      };
      reportBuildData({ buildData });
    }
  });
}
