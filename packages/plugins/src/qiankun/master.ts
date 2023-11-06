import assert from 'assert';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
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

function getDefaultMicroAppProps(api: IApi, key: string) {
  const microAppProps = api.config.qiankun?.master?.[key];
  assert(
    !microAppProps || microAppProps.startsWith?.('@/'),
    `[@umijs/plugin-qiankun]: ${key} only support src path, eg: @/${key}`,
  );
  return microAppProps;
}

export default (api: IApi) => {
  api.describe({
    key: 'qiankun-master',
    enableBy: isMasterEnable,
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'masterRuntimePlugin.tsx' })];
  });

  api.modifyDefaultConfig((config: any) => ({
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

  api.modifyRoutes((memo: any) => {
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      if (route.microApp) {
        const appName = route.microApp;
        const base = api.config.base || '/';
        const masterHistoryType = api.config.history?.type || 'browser';
        const routeProps = route.microAppProps || {};
        const normalizedRouteProps = JSON.stringify(routeProps).replace(
          /"/g,
          "'",
        );
        route.file = `(async () => {
          const { getMicroAppRouteComponent } = await import('@@/plugin-qiankun-master/getMicroAppRouteComponent');
          return getMicroAppRouteComponent({ appName: '${appName}', base: '${base}', routePath: '${route.path}', masterHistoryType: '${masterHistoryType}', routeProps: ${normalizedRouteProps} })
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
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import { MasterOptions } from './types'
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);
interface Config {
  master?: MasterOptions;
}
export interface IRuntimeConfig {
  qiankun?: XOR<MasterOptions, Config>;
  ${MODEL_EXPORT_NAME}?: () => Record<string, any>;
}
      `,
    });
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
      content: api.isPluginEnable('antd')
        ? getFileContent('AntdLoader.tsx')
        : // 开启了 antd 插件的时候，使用 antd 的 loader 组件，否则提示用户必须设置一个自定义的 loader 组件
          `export default function Loader() { console.warn(\`[plugins/qiankun]: Seems like you'r not using @umijs/plugin-antd, you need to provide a custom loader or set autoSetLoading false to shut down this warning!\`); return null; }`,
    });

    // 子应用默认的错误捕获组件
    api.writeTmpFile({
      path: 'defaultErrorBoundary.tsx',
      content: getDefaultMicroAppProps(api, 'defaultErrorBoundary')
        ? `export { default } from '${getDefaultMicroAppProps(
            api,
            'defaultErrorBoundary',
          )}';`
        : // 返回 null
          `export default null;`,
    });

    // 子应用默认的加载动画
    api.writeTmpFile({
      path: 'defaultLoader.tsx',
      content: getDefaultMicroAppProps(api, 'defaultLoader')
        ? `export { default } from '${getDefaultMicroAppProps(
            api,
            'defaultLoader',
          )}';`
        : // 返回 null
          `export default null;`,
    });

    [
      'common.ts',
      'constants.ts',
      'types.ts',
      'routeUtils.ts',
      'masterRuntimePlugin.tsx',
      'getMicroAppRouteComponent.tsx.tpl',
      'ErrorBoundary.tsx',
      'MicroApp.tsx',
      'MicroAppWithMemoHistory.tsx',
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
        let content = getFileContent(file);

        if (!api.config.qiankun.externalQiankun) {
          content = content.replace(
            /from 'qiankun'/g,
            `from '${winPath(dirname(require.resolve('qiankun/package')))}'`,
          );
        }

        api.writeTmpFile({
          path: file.replace(/\.tpl$/, ''),
          content: content
            .replace(
              '__USE_MODEL__',
              api.isPluginEnable('model')
                ? `import { useModel } from '@@/plugin-model'`
                : `const useModel = null;`,
            )
            .replace(
              /from 'lodash\//g,
              `from '${winPath(dirname(require.resolve('lodash/package')))}/`,
            ),
        });
      }
    });

    api.writeTmpFile({
      path: 'index.ts',
      content: `
export { MicroApp } from './MicroApp';
export { MicroAppWithMemoHistory } from './MicroAppWithMemoHistory';
      `,
    });
  });
};
