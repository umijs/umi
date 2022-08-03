import assert from 'assert';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { withTmpPath } from '../utils/withTmpPath';
import { qiankunStateFromMasterModelNamespace } from './constants';

type SlaveOptions = any;

// BREAK CHANGE: 需要手动配置 slave: {}，不能留空
function isSlaveEnable(opts: { userConfig: any }) {
  const slaveCfg = opts.userConfig?.qiankun?.slave;
  if (slaveCfg) {
    return slaveCfg.enable !== false;
  }
  return !!process.env.INITIAL_QIANKUN_SLAVE_OPTIONS;
}

export default (api: IApi) => {
  api.describe({
    key: 'qiankun-slave',
    enableBy: isSlaveEnable,
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'slaveRuntimePlugin.ts' })];
  });

  api.register({
    key: 'addExtraModels',
    fn() {
      return [
        withTmpPath({
          api,
          path: `qiankunModel.ts#{"namespace":"${qiankunStateFromMasterModelNamespace}"}`,
        }),
      ];
    },
  });
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
interface LifeCycles {
    bootstrap?: (props?: any) => Promise<any>;
    mount?: (props?: any) => Promise<any>;
    unmount?: (props?: any) => Promise<any>;
    update?: (props?: any) => Promise<any>;
}
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);
interface SlaveOption extends LifeCycles {
    enable?: boolean;
}
interface Config {
    slave?: SlaveOption;
}
export interface IRuntimeConfig {
    qiankun?: XOR<Config, LifeCycles>
}
      `,
    });
  });
  api.modifyDefaultConfig((memo) => {
    const initialSlaveOptions: SlaveOptions = {
      devSourceMap: true,
      ...JSON.parse(process.env.INITIAL_QIANKUN_SLAVE_OPTIONS || '{}'),
      ...(memo.qiankun || {}).slave,
    };
    const modifiedDefaultConfig = {
      ...memo,
      // 默认开启 runtimePublicPath，避免出现 dynamic import 场景子应用资源地址出问题
      runtimePublicPath: true,
      qiankun: {
        ...memo.qiankun,
        slave: initialSlaveOptions,
      },
    };

    const shouldNotModifyDefaultBase =
      api.userConfig.qiankun?.slave?.shouldNotModifyDefaultBase ??
      initialSlaveOptions.shouldNotModifyDefaultBase;
    const historyType = api.userConfig.history?.type || 'browser';
    if (!shouldNotModifyDefaultBase && historyType !== 'hash') {
      // @ts-ignore
      modifiedDefaultConfig.base = `/${api.pkg.name}`;
    }

    return modifiedDefaultConfig;
  });

  api.modifyConfig((config) => {
    // mfsu 场景默认给子应用增加 mfName 配置，从而避免冲突
    if (config.mfsu !== false) {
      config.mfsu = {
        ...config.mfsu,
        mfName:
          config.mfsu?.mfName ||
          `mf_${api.pkg.name
            // 替换掉包名里的特殊字符
            // e.g. @umi/ui -> umi_ui
            ?.replace(/^@/, '')
            .replace(/\W/g, '_')}`,
      };
    }
    return config;
  });

  api.addHTMLHeadScripts(() => {
    const dontModify =
      api.config.qiankun?.slave?.shouldNotModifyRuntimePublicPath;
    return dontModify
      ? []
      : [
          `window.publicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || "${
            api.config.publicPath || '/'
          }";`,
        ];
  });

  api.chainWebpack((config) => {
    assert(api.pkg.name, 'You should have name in package.json.');
    const { shouldNotAddLibraryChunkName } = (api.config.qiankun || {}).slave!;
    config.output
      .libraryTarget('umd')
      .library(
        shouldNotAddLibraryChunkName ? api.pkg.name : `${api.pkg.name}-[name]`,
      );
    // TODO: SOCKET_SERVER
    // TODO: devSourceMap
    return config;
  });

  // umi bundle 添加 entry 标记
  api.modifyHTML(($) => {
    $('script').each((_: any, el: any) => {
      const scriptEl = $(el);
      const umiEntry = /\/?umi(\.\w+)?\.js$/g;
      if (umiEntry.test(scriptEl.attr('src') ?? '')) {
        scriptEl.attr('entry', '');
      }
    });
    return $;
  });

  api.addEntryImports(() => {
    return [
      {
        source: '@@/plugin-qiankun-slave/lifecycles',
        specifier:
          '{ genMount as qiankun_genMount, genBootstrap as qiankun_genBootstrap, genUnmount as qiankun_genUnmount, genUpdate as qiankun_genUpdate }',
      },
    ];
  });

  api.addEntryCode(() => [
    `
export const bootstrap = qiankun_genBootstrap(render);
export const mount = qiankun_genMount('${api.config.mountElementId}');
export const unmount = qiankun_genUnmount('${api.config.mountElementId}');
export const update = qiankun_genUpdate();
if (!window.__POWERED_BY_QIANKUN__) {
  bootstrap().then(mount);
}
    `,
  ]);

  function getFileContent(file: string) {
    return readFileSync(
      join(__dirname, '../../libs/qiankun/slave', file),
      'utf-8',
    );
  }

  api.onGenerateFiles({
    fn() {
      //     api.writeTmpFile({
      //       path: 'slaveOptions.ts',
      //       content: `
      // let options = ${JSON.stringify((api.config.qiankun || {}).slave || {})};
      // export const getSlaveOptions = () => options;
      // export const setSlaveOptions = (newOpts) => options = ({ ...options, ...newOpts });
      //       `,
      //     });

      [
        'qiankunModel.ts',
        'connectMaster.tsx',
        'slaveRuntimePlugin.ts',
        'lifecycles.ts',
      ].forEach((file) => {
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
      });

      api.writeTmpFile({
        path: 'index.ts',
        content: `
export { connectMaster } from './connectMaster';
      `,
      });
    },
    before: 'model',
  });
};
