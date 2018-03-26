import debug from 'debug';
import assert from 'assert';
import winPath from './winPath';
import {
  PLACEHOLDER_IMPORT,
  PLACEHOLDER_RENDER,
  PLACEHOLDER_ROUTER_MODIFIER,
  PLACEHOLDER_HISTORY_MODIFIER,
} from './constants';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';

// 参考：
// https://github.com/vuejs/vue-cli/blob/next/packages/%40vue/cli-service/lib/PluginAPI.js

class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.utils = {
      // private for umi-plugin-dll
      _webpack: require('af-webpack/webpack'),
      _afWebpackGetConfig: require('af-webpack/getConfig').default,
      _afWebpackBuild: require('af-webpack/build').default,
      _webpackHotDevClientPath: require('af-webpack/react-dev-utils')
        .webpackHotDevClientPath,

      winPath,
      debug: debug(`umi-plugin: ${id}`),
    };
    this.placeholder = {
      IMPORT: PLACEHOLDER_IMPORT,
      RENDER: PLACEHOLDER_RENDER,
      ROUTER_MODIFIER: PLACEHOLDER_ROUTER_MODIFIER,
      HISTORY_MODIFIER: PLACEHOLDER_HISTORY_MODIFIER,
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
    assert(
      Array.isArray(files),
      `[PluginAPI] files for registerBabel must be Array, but got ${files}`,
    );
    addBabelRegisterFiles(files);
    registerBabel(this.service.babel, {
      cwd: this.service.cwd,
    });
  }
}

export default PluginAPI;
