import isPlainObject from 'is-plain-object';
import isEqual from 'lodash.isequal';

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

export default function(api, option) {
  api.onOptionChange(newOption => {
    if (isEqual(getPlugins(newOption), getPlugins(option))) {
      diffPlugins(newOption, option).forEach(key => {
        api.changePluginOption(getId(key), newOption[key]);
      });
      option = newOption;
    } else {
      api.restart();
    }
  });

  const plugins = {
    // mobile
    hd: () => require('./plugins/mobile/hd').default,
    fastClick: () => require('./plugins/mobile/fastClick').default,

    // performance
    library: () => require('./plugins/library').default,
    dynamicImport: () => require('./plugins/dynamicImport').default,
    dll: () => require('umi-plugin-dll').default,
    hardSource: () => require('./plugins/hardSource').default,
    pwa: () => require('./plugins/pwa').default,

    // misc
    dva: () => require('umi-plugin-dva').default,
    locale: () => require('umi-plugin-locale').default,
    polyfills: () => require('umi-plugin-polyfill').default,
    antd: () => require('./plugins/antd').default,
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
          ...toObject(opts),
          dynamicImport: option.dynamicImport,
        };
      }

      api.registerPlugin({
        id: getId(key),
        apply: plugins[key](),
        opts,
      });
    }
  });
}
