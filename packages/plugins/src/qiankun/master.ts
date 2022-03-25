import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { withTmpPath } from '../utils/withTmpPath';
import {
  defaultHistoryType,
  defaultMasterRootId,
  MODEL_EXPORT_NAME,
  qiankunStateForSlaveModelNamespace,
} from './constants';

export function isMasterEnable(opts: { userConfig: any }) {
  const masterCfg = opts.userConfig.qiankun?.master;
  if (masterCfg) {
    return masterCfg.enable !== false;
  }
  return !!process.env.INITIAL_QIANKUN_MASTER_OPTIONS;
}

export default (api: IApi) => {
  api.describe({
    key: 'qiankun-master',
    enableBy: isMasterEnable,
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'masterRuntimePlugin.tsx' })];
  });

  api.modifyDefaultConfig((config) => ({
    ...config,
    mountElementId: defaultMasterRootId,
    qiankun: {
      ...config.qiankun,
      master: {
        ...JSON.parse(process.env.INITIAL_QIANKUN_MASTER_OPTIONS || '{}'),
        ...(config.qiankun || {}).master,
      },
    },
  }));

  // TODO: modify routes
  api.modifyRoutes((memo) => {
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      if (route.microApp) {
        const appName = route.microApp;
        // TODO: config base
        const base = '/';
        // TODO: config masterHistoryType
        const masterHistoryType = 'browser';
        const routeProps = route.microAppProps || {};
        const normalizedRouteProps = JSON.stringify(routeProps).replace(
          /"/g,
          "'",
        );
        route.file = `(async () => {
          const { getMicroAppRouteComponent } = await import('@@/plugin-qiankun-master/getMicroAppRouteComponent');
          return getMicroAppRouteComponent({ appName: '${appName}', base: '${base}', masterHistoryType: '${masterHistoryType}', routeProps: ${normalizedRouteProps} })
        })()`;
      }
    });
    return memo;
  });

  // state model for slave app
  api.addRuntimePluginKey(() => [MODEL_EXPORT_NAME]);
  api.register({
    key: 'addExtraModels',
    fn() {
      const { path, exports } = api.appData.appJS || {};
      return path && exports.includes(MODEL_EXPORT_NAME)
        ? [
            `${path}#{"namespace":"${qiankunStateForSlaveModelNamespace}","exportName":"${MODEL_EXPORT_NAME}"}`,
          ]
        : [];
    },
  });

  function getFileContent(file: string) {
    return readFileSync(
      join(__dirname, '../../libs/qiankun/master', file),
      'utf-8',
    );
  }

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'masterOptions.ts',
      content: `
let options = ${JSON.stringify({
        masterHistoryType: api.config.history?.type || defaultHistoryType,
        base: api.config.base || '/',
        ...api.config.qiankun.master,
      })};
export const getMasterOptions = () => options;
export const setMasterOptions = (newOpts) => options = ({ ...options, ...newOpts });
      `,
    });

    api.writeTmpFile({
      path: 'MicroAppLoader.tsx',
      // 开启了 antd 插件的时候，使用 antd 的 loader 组件，否则提示用户必须设置一个自定义的 loader 组件
      content: api.isPluginEnable('antd')
        ? getFileContent('AntdLoader.tsx')
        : `export default function Loader() { console.warn(\`[plugins/qiankun]: Seems like you'r not using @umijs/plugin-antd, you need to provide a custom loader or set autoSetLoading false to shut down this warning!\`); return null; }`,
    });

    [
      'common.ts',
      'constants.ts',
      'types.ts',
      'masterRuntimePlugin.tsx',
      'getMicroAppRouteComponent.tsx.tpl',
      'ErrorBoundary.tsx',
      'MicroApp.tsx',
    ].forEach((file) => {
      if (file.endsWith('.tpl')) {
        api.writeTmpFile({
          path: file.replace(/\.tpl$/, ''),
          tpl: getFileContent(file),
          context: {
            dynamicRoot: false,
            hasModelPlugin: api.isPluginEnable('model'),
            // dynamicRoot:
            //   api.config.exportStatic && api.config.exportStatic.dynamicRoot,
          },
        });
      } else {
        api.writeTmpFile({
          path: file.replace(/\.tpl$/, ''),
          content: getFileContent(file)
            .replace(
              '__USE_MODEL__',
              api.isPluginEnable('model')
                ? `import { useModel } from '@@/plugin-model'`
                : `const useModel = null;`,
            )
            .replace(
              /from 'qiankun'/g,
              `from '${winPath(dirname(require.resolve('qiankun/package')))}'`,
            )
            .replace(
              /from 'lodash\//g,
              `from '${winPath(dirname(require.resolve('lodash/package')))}/`,
            ),
        });
      }
    });
  });
};
