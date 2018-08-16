const { reportData, reportBuildData } = require('atool-monitor');

export default function(api, opts = {}) {
  const umiVersion = require(require.resolve('umi/package.json')).version;
  //  上报 app + dev 数据
  api.onDevCompileDone(({ isFirstCompile, stats }) => {
    if (isFirstCompile && process.env.REPEAT_REPORT !== 'none') {
      // 只在 dev 的第一次编译上报数据
      const appData = {
        reportFrom: 'umi',
      };
      const appExtraData = {
        umiVersion,
        antdVersion: require(require.resolve('antd/package.json')).version,
      };
      const devData = {
        reportFrom: 'umi',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          UMI_ENV: process.env.UMI_ENV,
        },
        status: stats.hasErrors() ? 'fail' : 'success',
        startTime: stats.startTime,
        endTime: stats.endTime,
      };
      const devExtraData = {
        umiVersion,
      };
      reportData(appData, appExtraData, devData, devExtraData);
    }
  });

  // build 成功上报数据
  api.onBuildSuccess(({ stats }) => {
    const buildData = {
      reportFrom: 'umi',
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
    const extraData = {
      umiVersion,
    };
    reportBuildData(buildData, extraData);
  });

  // build 失败上报数据
  api.onBuildFail(({ err, stats }) => {
    const buildData = {
      reportFrom: 'umi',
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
    const extraData = {
      umiVersion: process.env.UMI_VERSION,
    };
    reportBuildData(buildData, extraData);
  });
}
