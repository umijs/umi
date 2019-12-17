import assert from 'assert';
import Service from './Service';
import { isValidPlugin, pathToObj } from './utils/plugin';
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

  describe() {}

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
