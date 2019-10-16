import { IApi } from 'umi-types';
import { join } from 'path';

export default (api: IApi) => {
  const { relativeToTmp, winPath } = api;
  // TODO: 区分生产和开发环境，生产环境引打包好的，或者通过异步远程加载也可以
  if (process.env.NODE_ENV === 'development' && !api.config.ssr) {
    api.addEntryCode(`
    (() => {
      try {
        const ua = window.navigator.userAgent;
        const isIE = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
        if (isIE) return;
        
        // Umi UI Bubble
        require('${relativeToTmp(join(__dirname, './bubble'))}').default({
          port: ${process.env.UMI_UI_PORT},
          path: '${winPath(api.cwd)}',
          currentProject: '${process.env.UMI_UI_CURRENT_PROJECT || ''}',
          isBigfish: ${process.env.BIGFISH_COMPAT},
        });
      } catch (e) {
        console.warn('Umi UI render error:', e);
      }
    })();
  `);

    api.modifyAFWebpackOpts(memo => {
      memo.extraBabelIncludes = [...(memo.extraBabelIncludes || []), join(__dirname, '../bubble')];
      return memo;
    });

    api.chainWebpackConfig(config => {
      config.plugin('umi-ui-compile-status').use(require('./CompileStatusWebpackPlugin').default);
    });
  }

  require('./plugins/dashboard/index').default(api);
  require('./plugins/configuration/index').default(api);
  require('./plugins/tasks/index').default(api);
};
