import vueJsx from '@vitejs/plugin-vue-jsx';
import type { IApi } from 'umi';
// @ts-ignore
import vue from '../../../compiled/@vitejs/plugin-vue';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vite',
  });

  api.describe({
    key: 'vuejsx',
    config: {
      schema({ zod }) {
        return zod.object({});
      },
      default: {},
    },
  });

  api.modifyViteConfig((config) => {
    config.plugins?.push(vue(api.config.vue));
    config.plugins?.push(vueJsx(api.config.vuejsx));
    return config;
  });
};
