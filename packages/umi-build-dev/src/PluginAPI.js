import debug from 'debug';
import assert from 'assert';
import { winPath } from 'umi-utils';
import {
  PLACEHOLDER_IMPORT,
  PLACEHOLDER_RENDER,
  PLACEHOLDER_ROUTER_MODIFIER,
  PLACEHOLDER_ROUTES_MODIFIER,
  PLACEHOLDER_HISTORY_MODIFIER,
} from './constants';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';

class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.debug = debug(`umi-plugin: ${id}`);
    this.utils = {
      // private for umi-plugin-dll
      _webpack: require('af-webpack/webpack'),
      _afWebpackGetConfig: require('af-webpack/getConfig').default,
      _afWebpackBuild: require('af-webpack/build').default,
      _webpackHotDevClientPath: require('af-webpack/react-dev-utils')
        .webpackHotDevClientPath,
    };
    this.placeholder = {
      IMPORT: PLACEHOLDER_IMPORT,
      RENDER: PLACEHOLDER_RENDER,
      ROUTER_MODIFIER: PLACEHOLDER_ROUTER_MODIFIER,
      ROUTES_MODIFIER: PLACEHOLDER_ROUTES_MODIFIER,
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

  registerCommand(name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts;
      opts = null;
    }
    this.service.commands[name] = { fn, opts: opts || {} };
  }

  modifyWebpackConfig(fn) {
    this.register('modifyWebpackConfig', fn);
  }

  chainWebpack(fn) {
    this.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {
      fn(webpackConfig);
    });
  }

  registerBabel(files) {
    assert(
      Array.isArray(files),
      `[PluginAPI] files for registerBabel must be Array, but got ${files}`,
    );
    addBabelRegisterFiles(files);
    registerBabel({
      cwd: this.service.cwd,
    });
  }
}

export default PluginAPI;
