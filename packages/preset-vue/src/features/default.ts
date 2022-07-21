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

    // .vue 文件会被解析成 template 和 script 两个产物但是对应的 filename babel 识别成同一个, 导致 MFSU 解析时 如果 template 先解析 script 会被当做缓存不在被解析
    // 解法是 当判断 filename 后缀是 .vue 时 补齐 resourceQuery 这样缓存会是两份
    memo.babelLoaderCustomize = require.resolve('./vueBabelLoaderCustomize');
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
