import assert from 'assert';
import { IApi } from 'umi-types';

const KEYS = ['group', 'name', 'title', 'default', 'type', 'choices', 'description', 'value'];

const KEYS_WITH_LANG = ['title', 'description'];

const groupMap = {
  basic: {
    'zh-CN': '基础配置',
    'en-US': 'Basic Configuration',
  },
};

function getTextByLang(text, lang) {
  if (!text) return null;
  if (typeof text === 'string') {
    return text;
  } else if (lang in text) {
    return text[lang];
  } else {
    assert('en-US' in text, `Invalid text ${text}, should have en-US key`);
    return text['en-US'];
  }
}

export function formatConfigs(configs, lang = 'en-US') {
  return configs.reduce((memo, config) => {
    (config.configs || [config]).forEach(config => {
      if (config.type) {
        memo.push(
          Object.keys(config).reduce((memo, key) => {
            if (KEYS.includes(key)) {
              if (key === 'group') {
                memo[key] = groupMap[config[key]]
                  ? getTextByLang(groupMap[config[key]], lang)
                  : config[key];
              } else if (KEYS_WITH_LANG.includes(key)) {
                memo[key] = getTextByLang(config[key], lang);
              } else {
                memo[key] = config[key];
              }
            }
            if (!memo.group) {
              (memo.group === lang) === 'zh-CN' ? '未分组' : 'Ungrouped';
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
  function getConfig(lang) {
    const { userConfig } = (api as any).service;
    const config = userConfig.getConfig({ force: true });
    return formatConfigs(userConfig.plugins, lang).map(p => {
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
          data: getConfig(payload && payload.lang),
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
