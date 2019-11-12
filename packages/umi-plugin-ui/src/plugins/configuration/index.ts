import assert from 'assert';
import { IApi } from 'umi-types';

const KEYS = [
  'group',
  'name',
  'title',
  'default',
  'type',
  'choices',
  'description',
  'value',
  'transforms',
  'link',
];
const KEYS_WITH_LANG = ['title', 'description', 'link'];
const DEFAULT_GROUP_MAP = {
  basic: {
    'zh-CN': '基础配置',
    'en-US': 'Basic Configuration',
  },
  route: {
    'zh-CN': '路由配置',
    'en-US': 'Route Configuration',
  },
  deploy: {
    'zh-CN': '部署配置',
    'en-US': 'Deploy Configuration',
  },
  webpack: {
    'zh-CN': 'Webpack 配置',
    'en-US': 'Webpack Configuration',
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

interface IFormatConfigOpts {
  lang?: 'string';
  groupMap?: any;
}

export function formatConfigs(configs, opts: IFormatConfigOpts = {}) {
  const { lang = 'en-US', groupMap = DEFAULT_GROUP_MAP } = opts;
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
              memo.group = lang === 'zh-CN' ? '未分组' : 'Ungrouped';
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
  while (typeof config === 'object' && keys[i] in config) {
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
    return formatConfigs(userConfig.plugins, {
      lang,
      groupMap: api.applyPlugins('modifyUIConfigurationGroupMap', {
        initialValue: DEFAULT_GROUP_MAP,
      }),
    }).map(p => {
      const [haveKey, value] = useConfigKey(config, p.name);
      if (haveKey) {
        p.value = value;
        if (p.transforms) {
          p.value = p.transforms[0](p.value);
        }
      }
      if (!p.link) {
        const baseUrl =
          lang === 'zh-CN' ? 'https://umijs.org/zh/config/' : 'https://umijs.org/config/';
        p.link = `${baseUrl}#${p.name.toLowerCase().replace(/\./g, '-')}`;
      }
      return p;
    });
  }

  function parseString(str) {
    if (str.startsWith('{') || str.startsWith('[') || str === 'true' || str === 'false') {
      return JSON.parse(str);
    } else {
      return str;
    }
  }

  // TODO: 支持子项的 validate
  function validateConfig(config) {
    let errors = [];
    const { userConfig } = (api as any).service;
    userConfig.plugins.forEach(p => {
      if (p.name in config) {
        try {
          if (p.transforms) {
            config[p.name] = JSON.stringify(p.transforms[1](config[p.name]));
          }
          if (p.validate) {
            p.validate(parseString(config[p.name]));
          }
        } catch (e) {
          errors.push({
            name: p.name,
            errors: [e.message],
          });
        }
      }
    });
    if (errors.length) {
      const e = new Error('Config validate failed');
      e.errors = errors;
      throw e;
    }
  }

  api.addUIPlugin(require.resolve('../../../src/plugins/configuration/dist/ui.umd'));

  api.onUISocket(({ action, failure, success }) => {
    const { type, payload, lang } = action;
    switch (type) {
      case 'org.umi.config.list':
        success({
          data: getConfig(lang),
        });
        break;
      case 'org.umi.config.edit':
        let config = payload.key;
        if (typeof payload.key === 'string') {
          config = {
            [payload.key]: payload.value,
          };
        }
        try {
          validateConfig(config);
          (api as any).service.runCommand('config', {
            _: ['set', config],
          });
          success();
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
