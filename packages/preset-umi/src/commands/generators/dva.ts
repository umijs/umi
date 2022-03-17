import { GeneratorType } from '@umijs/core';
import { fsExtra, installWithNpmClient, logger } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { set as setUmirc } from '../config/set';

function hasDeps({ name, pkg }: { name: string; pkg: any }) {
  return pkg.dependencies?.[name] || pkg.devDependencies?.[name];
}

function checkStatus({ pkg }: { pkg: any }) {
  let needInstall = true;
  // 有以下依赖时不需要安装 @umijs/plugins
  if (
    hasDeps({ pkg, name: '@umijs/plugins' }) ||
    hasDeps({ pkg, name: '@umijs/max' }) ||
    hasDeps({ pkg, name: '@alipay/bigfish' })
  ) {
    needInstall = false;
  }

  let needConfigPlugins = true;
  // 有以下依赖时不需要配置依赖
  if (
    hasDeps({ pkg, name: '@umijs/max' }) ||
    hasDeps({ pkg, name: '@alipay/bigfish' })
  ) {
    needConfigPlugins = false;
  }

  return {
    needInstall,
    needConfigPlugins,
  };
}

export default (api: IApi) => {
  api.describe({
    key: 'generator:dva',
  });

  api.registerGenerator({
    key: 'dva',
    name: 'Enable Dva',
    description: 'Configuration, Dependencies, and Model Files for Dva',
    type: GeneratorType.enable,
    checkEnable: () => {
      return !api.config.dva;
    },
    fn: async () => {
      const { needInstall, needConfigPlugins } = checkStatus({
        pkg: api.pkg,
      });

      // write package.json
      if (needInstall) {
        api.pkg.devDependencies = {
          ...api.pkg.devDependencies,
          '@umijs/plugins': 'next',
        };
        writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
        logger.info('Write package.json');
      }

      // set config
      setUmirc(api, 'dva', {});
      if (needConfigPlugins) {
        setUmirc(
          api,
          'plugins',
          (api.userConfig.plugins || []).concat('@umijs/plugins/dist/dva'),
        );
      }
      logger.info('Update config file');

      // example model
      const modelsPath = join(api.paths.absSrcPath, 'models');
      fsExtra.outputFileSync(
        join(modelsPath, 'count.ts'),
        `
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default {
  namespace: 'count',
  state: {
    num: 0,
  },
  reducers: {
    add(state: any) {
      state.num += 1;
    },
  },
  effects: {
    *addAsync(_action: any, { put }: any) {
      yield delay(1000);
      yield put({ type: 'add' });
    },
  },
};
        `,
      );
      logger.info('Write example model');

      // install deps
      const { npmClient } = api.appData;
      installWithNpmClient({
        npmClient,
      });
      logger.info(`Install dependencies with ${npmClient}`);
    },
  });
};
