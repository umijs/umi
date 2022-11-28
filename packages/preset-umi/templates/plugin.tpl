{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}
import { PluginManager } from 'umi';

function __defaultExport (obj) {
  const { default: defineFunc, ...overrides } = obj;
  const definedExports = (typeof defineFunc === 'function' ? defineFunc() : defineFunc) || {};
  if (process.env.NODE_ENV !== 'production') {
    const defineAppKeys = Object.keys(definedExports);
    // should use named exports keys
    const shouldNamedExportKeys = [{{#shouldNamedExportKeys}}'{{{ . }}}',{{/shouldNamedExportKeys}}];
    const intersectionKeys = defineAppKeys.filter(key => shouldNamedExportKeys.includes(key));
    if (intersectionKeys.length) {
      console.error(
`[umi]: The export \`${intersectionKeys.join(', ')}\` is not supported in \`defineApp()\` (app.ts) .\n
         You should use the named export:\n
         export const ${intersectionKeys[0]} = ...
`
      );
    }
    // ensure export only once
    const overrideKeys = Object.keys(overrides || {});
    const multiExportKeys = defineAppKeys.filter(key => overrideKeys.includes(key));
    if (multiExportKeys.length) {
      console.error(
`[umi]: The export \`${multiExportKeys.join(', ')}\` is with multiple exports in \`defineApp()\` and named export (app.ts): .\n
         You should export only once:\n
         export const ${multiExportKeys[0]} = ...  or  export default defineApp({ ${multiExportKeys[0]} })
`
      );
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
export function createPluginManager() {
  pluginManager = PluginManager.create({
    plugins: getPlugins(),
    validKeys: getValidKeys(),
  });
  return pluginManager;
}

export function getPluginManager() {
  return pluginManager;
}
