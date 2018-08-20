const { join } = require('path');
const { reportData, reportBuildData } = require('atool-monitor');

export default function(api, opts = {}) {
  //  上报 app + dev 数据
  api.onDevCompileDone(({ isFirstCompile, stats }) => {
    if (isFirstCompile && process.env.REPEAT_REPORT !== 'none') {
      // 只在 dev 的第一次编译上报数据 + 避免重复上报
      // 以 umi 为底层工具的框架上报数据后，umi 这边不再上报
      const antdPath = api.webpackConfig.resolve.alias.antd;
      const appData = {
        reportFrom: 'umi',
        umiVersion: process.env.UMI_VERSION,
        antdVersion:
          antdPath && require(join(antdPath, 'package.json')).version, // 项目可能不依赖 antd，需要做判断
      };
      const devData = {
        reportFrom: 'umi',
        umiVersion: process.env.UMI_VERSION,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          UMI_ENV: process.env.UMI_ENV,
        },
        status: stats.hasErrors() ? 'fail' : 'success',
        startTime: stats.startTime,
        endTime: stats.endTime,
      };
      try {
        reportData({ appData, devData });
      } catch (e) {}
    }
  });

  // build 成功上报数据
  api.onBuildSuccess(({ stats }) => {
    if (process.env.REPEAT_REPORT !== 'none') {
      // 以 umi 为底层工具的框架上报数据后，umi 这边不再上报
      const buildData = {
        reportFrom: 'umi',
        umiVersion: process.env.UMI_VERSION,
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
      try {
        reportBuildData({ buildData });
      } catch (e) {}
    }
  });

  // build 失败上报数据
  api.onBuildFail(({ err, stats }) => {
    if (stats && process.env.REPEAT_REPORT !== 'none') {
      // stats 不为空时才上报数据，说明构建过程没有中断，这样上报的数据才有意义
      // 以 umi 为底层工具的框架上报数据后，umi 这边不再上报
      const buildData = {
        reportFrom: 'umi',
        umiVersion: process.env.UMI_VERSION,
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
      try {
        reportBuildData({ buildData });
      } catch (e) {}
    }
  });
}
