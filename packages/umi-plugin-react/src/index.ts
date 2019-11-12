import { IApi } from 'umi-types';
import { isPlainObject, isEqual } from 'lodash';
import ui from './ui';

function toObject(o) {
  if (!isPlainObject(o)) {
    return {};
  } else {
    return o;
  }
}

function getId(id) {
  return `umi-plugin-react:${id}`;
}

function getPlugins(obj) {
  return Object.keys(obj).filter(key => obj[key]);
}

function diffPlugins(newOption, oldOption) {
  return Object.keys(newOption).filter(key => {
    return newOption[key] && !isEqual(newOption[key], oldOption[key]);
  });
}

export default function(api: IApi, option) {
  const { debug } = api;

  api.onOptionChange(newOption => {
    debug('new option');
    debug(newOption);
    if (isEqual(getPlugins(newOption), getPlugins(option))) {
      diffPlugins(newOption, option).forEach(key => {
        debug(`change plugin option: ${key}`);
        api.changePluginOption(getId(key), newOption[key]);
      });
      option = newOption;
    } else {
      debug('restart');
      api.restart();
    }
  });

  const plugins = {
    // mobile
    hd: () => require('./plugins/hd').default,
    fastClick: () => require('./plugins/fastClick').default,

    // performance
    library: () => require('./plugins/library').default,
    dynamicImport: () => require('./plugins/dynamicImport').default,
    dll: () => require('./plugins/dll').default,
    hardSource: () => require('./plugins/hardSource').default,
    pwa: () => require('./plugins/pwa').default,

    // html tags
    chunks: () => require('./plugins/chunks').default,
    scripts: () => require('./plugins/scripts').default,
    headScripts: () => require('./plugins/headScripts').default,
    links: () => require('./plugins/links').default,
    metas: () => require('./plugins/metas').default,

    // misc
    dva: () => require('./plugins/dva').default,
    locale: () => require('./plugins/locale').default,
    polyfills: () => require('./plugins/polyfills').default,
    routes: () => require('./plugins/routes').default,
    antd: () => require('./plugins/antd').default,
    title: () => require('./plugins/title').default,
  };

  Object.keys(plugins).forEach(key => {
    if (option[key]) {
      let opts = option[key];
      if (key === 'locale') {
        opts = {
          antd: option.antd,
          ...opts,
        };
      }
      if (key === 'dva') {
        opts = {
          dynamicImport: option.dynamicImport,
          ...toObject(opts),
        };
      }

      api.registerPlugin({
        id: getId(key),
        apply: plugins[key](),
        opts,
      });
    }
  });

  // umi ui
  ui(api);
}
