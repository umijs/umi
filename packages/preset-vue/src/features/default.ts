import { dirname } from 'path';
import type { IApi } from 'umi';
import { resolveProjectDep } from '../utils/resolveProjectDep';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:default',
  });

  const vuePath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'vue/dist/vue.esm-bundler.js',
    }) || require.resolve('vue/dist/vue.esm-bundler.js');

  const vueRuntimePath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'vue/dist/vue.runtime.esm-bundler.js',
    }) || require.resolve('vue/dist/vue.runtime.esm-bundler.js');

  api.modifyDefaultConfig((config) => {
    config.alias = {
      ...config.alias,
      vue: api.userConfig.vue?.runtimeCompiler ? vuePath : vueRuntimePath,
      'vue-router':
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'vue-router',
        }) || dirname(require.resolve('vue-router/package.json')),
    };

    // feature flags https://link.vuejs.org/feature-flags.
    config.define = {
      ...config.define,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    };

    return config;
  });

  api.modifyConfig((memo) => {
    // react 独有配置需要禁用
    memo.fastRefresh = false;
    // vue not need svgr
    memo.svgr = false;
    return memo;
  });

  api.modifyAppData((memo) => {
    memo.framework = 'vue';
    return memo;
  });

  api.modifyRendererPath(() =>
    dirname(require.resolve('@umijs/renderer-vue/package.json')),
  );

  api.modifyBabelPresetOpts((memo) => {
    memo.presetTypeScript = {
      // 支持 vue 后缀
      allExtensions: true,
      // 支持 tsx
      isTSX: true,
    };
    return memo;
  });

  // 增加运行时key
  api.addRuntimePluginKey(() => [
    'router',
    'onRouterCreated',
    'onAppCreated',
    'onMounted',
  ]);
};
