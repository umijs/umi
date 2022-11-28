{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}
import { PluginManager } from 'umi';

function __defaultExport (obj) {
  const { default: defineFunc, ...overrides } = obj;
  const definedExports = (typeof defineFunc === 'function' ? defineFunc() : defineFunc) || {};
  if (process.env.NODE_ENV !== 'production') {
    const shouldNamedExportKeys = [{{#shouldNamedExportKeys}}'{{{ . }}}',{{/shouldNamedExportKeys}}];
    const intersectionKeys = Object.keys(definedExports).filter(key => shouldNamedExportKeys.includes(key));
    if (intersectionKeys.length) {
      console.error(
`[umi]: The key \`${intersectionKeys.join(', ')}\` is not supported in \`defineApp()\` (app.ts) .\n
         You should use the named export:\n
         export const ${intersectionKeys[0]} = ...
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
