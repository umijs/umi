{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}
import { PluginManager } from 'umi';

export function getPlugins() {
  return [
{{#plugins}}
    {
      apply: Plugin_{{{ index }}},
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
