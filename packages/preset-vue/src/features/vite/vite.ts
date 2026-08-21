import type { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vite',
  });

  api.modifyViteConfig(async (config) => {
    const [vueModule, { default: vueJsx }] = await Promise.all([
      // @ts-ignore compiled ESM plugin does not ship generated declarations
      import('../../../compiled/@vitejs/plugin-vue/index.js'),
      import('@vitejs/plugin-vue-jsx'),
    ]);
    const vue = (vueModule.default as any).default || vueModule.default;
    config.plugins?.push(vue(api.config.vue));
    config.plugins?.push(vueJsx(api.config?.vue?.pluginJsx));
    return config;
  });
};
