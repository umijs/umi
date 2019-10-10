import { IApi } from 'umi-types';
import { formatConfigs, useConfigKey } from 'umi-plugin-ui/lib/plugins/configuration';
import { configs, groupMap } from './config';

export function getPluginConfig(plugins, name) {
  for (const plugin of plugins) {
    if (typeof plugin === 'string' && plugin === name) {
      return {};
    }
    if (Array.isArray(plugin) && plugin[0] === name) {
      if (typeof plugin[1] === 'object') {
        return plugin[1];
      } else {
        return {};
      }
    }
  }
  return null;
}

export default (api: IApi) => {
  if (process.env.UMI_UI === 'none') return;

  function getConfig(lang) {
    const { userConfig } = api.service;
    const { plugins } = userConfig.getConfig({ force: true });
    const pluginConfig = getPluginConfig(plugins, 'umi-plugin-react');
    return formatConfigs(configs, {
      lang,
      groupMap,
    }).map(p => {
      const [haveKey, value] = useConfigKey(pluginConfig, p.name);
      if (haveKey) {
        p.value = value;
      }
      return p;
    });
  }

  function validateConfig(config) {}

  if (api.addUIPlugin) {
    api.addUIPlugin(require.resolve('../ui/dist/index.umd'));
  }

  if (api.onUISocket) {
    api.onUISocket(({ action, failure, success }) => {
      const { type, payload, lang } = action;
      switch (type) {
        case 'org.umi.umi-plugin-react.config.list':
          success({
            data: getConfig(lang),
          });
          break;
        case 'org.umi.umi-plugin-react.config.edit':
          let config = payload.key;
          if (typeof payload.key === 'string') {
            config = {
              [payload.key]: payload.value,
            };
          }
          try {
            validateConfig(config);
            api.service.runCommand('config', {
              _: ['set', config],
              plugin: 'umi-plugin-react',
            });
            success({});
          } catch (e) {
            failure({
              message: e.message,
              errors: e.errors,
            });
          }
          break;
        default:
          break;
      }
    });
  }
};
