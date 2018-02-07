import debug from 'debug';
import excapeRegExp from 'lodash.escaperegexp';
import winPath from './winPath';
import { PLACEHOLDER_IMPORT } from './constants';
import registerBabel from './registerBabel';

// 参考：
// https://github.com/vuejs/vue-cli/blob/next/packages/%40vue/cli-service/lib/PluginAPI.js

class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.utils = {
      winPath,
      debug: debug(`umi-plugin: ${id}`),
    };
    this.placeholder = {
      IMPORT: PLACEHOLDER_IMPORT,
    };
  }

  register(key, fn) {
    if (!this.service.pluginMethods[key]) {
      this.service.pluginMethods[key] = [];
    }
    this.service.pluginMethods[key].push({
      fn,
    });
  }

  modifyWebpackConfig(fn) {
    this.register('modifyWebpackConfig', fn);
  }

  registerBabel(files) {
    const excapedFiles = files.map(file => excapeRegExp(file));
    registerBabel(this.service.babel, {
      only: [new RegExp(`(${excapedFiles.join('|')})`)],
    });
  }
}

export default PluginAPI;
