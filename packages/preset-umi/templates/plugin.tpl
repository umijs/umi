{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}
import { PluginManager } from 'umi';
import { terminal } from './terminal'

function __defaultExport (obj) {
  const { default: defineFunc, ...overrides } = obj;
  const definedExports = (typeof defineFunc === 'function' ? defineFunc() : defineFunc) || {};
  if (process.env.NODE_ENV !== 'production') {
    const defineAppKeys = Object.keys(definedExports);
    // should use named exports keys
    const shouldNamedExportKeys = [{{#shouldNamedExportKeys}}'{{{ . }}}',{{/shouldNamedExportKeys}}];
    const intersectionKeys = defineAppKeys.filter(key => shouldNamedExportKeys.includes(key));
    if (intersectionKeys.length) {
      const errorMsg = `[umi]: The export \`${intersectionKeys.join(', ')}\` is not supported in \`defineApp()\` (app.ts) .\n
         You should use the named export:\n
         export const ${intersectionKeys[0]} = ...
`;
      terminal.error(errorMsg);
      console.error(errorMsg);
    }
    // ensure export only once
    const overrideKeys = Object.keys(overrides || {});
    const multiExportKeys = defineAppKeys.filter(key => overrideKeys.includes(key));
    if (multiExportKeys.length) {
      const errorMsg = `[umi]: The export \`${multiExportKeys.join(', ')}\` is with multiple exports in \`defineApp()\` and named export (app.ts): .\n
         You should export only once:\n
         export const ${multiExportKeys[0]} = ...  or  export default defineApp({ ${multiExportKeys[0]} })
`;
      terminal.error(errorMsg);
      console.error(errorMsg);
    }
  }
  return {
    ...definedExports,
    ...overrides
  };
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
