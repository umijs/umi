import type Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { IApi } from 'umi';
import { getConfig } from './config/config';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:webpack',
  });

  api.chainWebpack((config) => {
    getConfig(config, api);
    return config;
  });

  api.modifyConfig((memo) => {
    // 处理 mfsu 包含vue 模块的依赖处理
    const enableMFSU = memo.mfsu !== false;
    if (enableMFSU) {
      memo.mfsu = {
        ...(memo.mfsu || {}),
        chainWebpack(config: Config) {
          getConfig(config, api);
          return config;
        },
      };
    }

    return memo;
  });
};
