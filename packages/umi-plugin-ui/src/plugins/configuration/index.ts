import { IApi } from 'umi-types';

const KEYS = ['name', 'default', 'group', 'type', 'choices', 'description', 'value'];

export function formatConfigs(configs) {
  return configs.reduce((memo, config) => {
    (config.configs || [config]).forEach(config => {
      if (config.type) {
        memo.push(
          Object.keys(config).reduce((memo, key) => {
            if (KEYS.includes(key)) {
              memo[key] = config[key];
            }
            return memo;
          }, {}),
        );
      }
    });
    return memo;
  }, []);
}

export function useConfigKey(config, key) {
  const keys = key.split('.');
  let i = 0;
  while (keys[i] in config) {
    const newConfig = config[keys[i]];
    if (i === keys.length - 1) {
      return [true, newConfig];
    }
    config = newConfig;
    i += 1;
  }
  return [false];
}

export default function(api: IApi) {
  function getConfig() {
    const { userConfig } = (api as any).service;
    const config = userConfig.getConfig({ force: true });
    return formatConfigs(userConfig.plugins).map(p => {
      const [haveKey, value] = useConfigKey(config, p.name);
      if (haveKey) {
        p.value = value;
      }
      return p;
    });
  }

  api.addUIPlugin(require.resolve('../../../src/plugins/configuration/dist/ui.umd'));

  api.onUISocket(({ action, success }) => {
    const { type, payload } = action;
    switch (type) {
      case 'org.umi.config.list':
        success({
          data: getConfig(),
        });
        break;
      case 'org.umi.config.edit':
        (api as any).service.runCommand('config', {
          _: ['set', payload.key, payload.value],
        });
        success();
        break;
      default:
        break;
    }
  });
}
