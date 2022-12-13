{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}
import { PluginManager } from 'umi';

function __defaultExport (obj) {
  if (obj.default) {
    return typeof obj.default === 'function' ? obj.default() :  obj.default
  }
  return obj;
}
export function getPlugins() {
  return [
{{#plugins}}
    {
      apply: {{#hasDefaultExport}}__defaultExport(Plugin_{{{ index }}}),{{/hasDefaultExport}}{{^hasDefaultExport}}Plugin_{{{ index }}},{{/hasDefaultExport}}
      path: process.env.NODE_ENV === 'production' ? void 0 : '{{{ path }}}',
    },
{{/plugins}}
  ];
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

let pluginManager = null;

// 确保 webpack 模式 import.meta.hot 代码被 tree shaking 掉
const isDev = process.env.NODE_ENV === 'development';

export function createPluginManager() {
  pluginManager = PluginManager.create({
    plugins: getPlugins(),
    validKeys: getValidKeys(),
  });

  // fix https://github.com/umijs/umi/issues/10047
  // https://vitejs.dev/guide/api-hmr.html#hot-data 通过 hot data 持久化 pluginManager 解决 vite 热更时 getPluginManager 获取到 null 的情况
  if (isDev && import.meta.hot) {
    import.meta.hot.data.pluginManager = pluginManager
  }
  return pluginManager;
}

export function getPluginManager() {
  // vite 热更模式优先从 hot data 中获取 pluginManager
  if (isDev && import.meta.hot) {
    return import.meta.hot.data.pluginManager || pluginManager
  }
  return pluginManager;
}
