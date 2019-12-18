import assert from 'assert';
import Service from './Service';
import { isValidPlugin, pathToObj } from './utils/pluginUtils';
import { PluginType, ServiceStage } from './enums';

interface IOpts {
  id: string;
  key: string;
  service: Service;
}

export default class PluginAPI {
  id: string;
  key: string;
  service: Service;

  constructor(opts: IOpts) {
    this.id = opts.id;
    this.key = opts.key;
    this.service = opts.service;
  }

  registerCommand() {}

  describe({ id, key }: { id?: string; key?: string } = {}) {
    const { plugins } = this.service;
    if (id && this.id !== id) {
      if (plugins[id]) {
        throw new Error(
          `plugin ${id} is already registered by ${plugins[id].path}, describe failed.`,
        );
      }
      plugins[id].id = id;
      plugins[id] = plugins[this.id];
      delete plugins[this.id];
      this.id = id;
    }
    if (key && this.key !== key) {
      this.key = key;
      plugins[this.id].key = key;
    }
  }

  register(hook: string, fn: Function) {
    assert(
      typeof hook === 'string',
      `The first argument of api.register() must be string, but got ${hook}`,
    );
    assert(
      typeof fn === 'function',
      `The second argument of api.register() must be function, but got ${fn}`,
    );
    this.service.hooksByPluginId[this.id] = (
      this.service.hooksByPluginId[this.id] || []
    ).concat({ hook, fn });
  }

  registerPresets(presets: (IPreset | string)[]) {
    assert(
      this.service.stage === ServiceStage.initPresets,
      `registerPresets should only used in presets.`,
    );
    if (!Array.isArray(presets)) presets = [presets];
    const extraPresets = presets.map(preset => {
      return isValidPlugin(preset as any)
        ? (preset as IPreset)
        : pathToObj(PluginType.preset, preset as string);
    });
    this.service._extraPresets.splice(0, 0, ...extraPresets);
  }

  // 在 preset 初始化阶段放后面，在插件注册阶段放前面
  registerPlugins(plugins: (IPlugin | string)[]) {
    assert(
      this.service.stage === ServiceStage.initPresets ||
        this.service.stage === ServiceStage.initPlugins,
      `registerPlugins should only used in registering stage.`,
    );
    if (!Array.isArray(plugins)) plugins = [plugins];
    const extraPlugins = plugins.map(plugin => {
      return isValidPlugin(plugin as any)
        ? (plugin as IPreset)
        : pathToObj(PluginType.plugin, plugin as string);
    });
    if (this.service.stage === ServiceStage.initPresets) {
      this.service._extraPlugins.push(...extraPlugins);
    } else {
      this.service._extraPlugins.splice(0, 0, ...extraPlugins);
    }
  }
}
