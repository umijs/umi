import winPath from './winPath';

// 参考：
// https://github.com/vuejs/vue-cli/blob/next/packages/%40vue/cli-service/lib/PluginAPI.js

class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.utils = {
      winPath,
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
}

export default PluginAPI;
