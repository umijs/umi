import vueJsx from '@vitejs/plugin-vue-jsx';
import type { IApi } from 'umi';
// @ts-ignore
import vue from '../../../compiled/@vitejs/plugin-vue';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vite',
  });

  api.modifyViteConfig((config) => {
    config.plugins?.push(vue(api.config.vue));
    config.plugins?.push(vueJsx(api.config?.vue?.pluginJsx));
    return config;
  });
};
