import { join } from 'path';
import assert from 'assert';
import { createDebug } from '@umijs/utils';
import { pathToObj, resolvePlugins, resolvePresets } from './utils/pluginUtils';
import PluginAPI from './PluginAPI';
import { PluginType, ServiceStage } from './enums';

const debug = createDebug('umi:core:Service');

interface IOpts {
  cwd: string;
  presets?: string[];
  plugins?: string[];
  useBuiltIn?: boolean;
}

interface IConfig {
  presets?: string[];
  plugins?: string[];
}

export default class Service {
  cwd: string;
  pkg: IPackage;
  // lifecycle stage
  stage: ServiceStage = ServiceStage.uninitiialized;
  // registered commands
  commands: object = {};
  // including presets and plugins
  plugins: {
    [id: string]: IPlugin;
  } = {};
  // initial presets and plugins from arguments, config, process.env, and package.json
  initialPresets: IPreset[];
  initialPlugins: IPlugin[];
  // presets and plugins for registering
  _extraPresets: IPreset[] = [];
  _extraPlugins: IPlugin[] = [];
  // user config
  config: IConfig = {};
  hooksByPluginId: {
    [id: string]: IHook[];
  } = {};
  hooks: {
    [hook: string]: Function[];
  } = {};

  constructor(opts: IOpts) {
    debug('opts:');
    debug(opts);
    this.cwd = opts.cwd || process.cwd();
    this.pkg = this.resolvePackage();

    // get user config without validation
    this.config = this.getUserConfig();

    // setup initial presets and plugins
    const baseOpts = {
      pkg: this.pkg,
      cwd: this.cwd,
      useBuiltIn: Boolean(opts.useBuiltIn),
    };
    this.initialPresets = resolvePresets({
      ...baseOpts,
      presets: [...(this.config.presets || []), ...(opts.presets || [])],
    });
    this.initialPlugins = resolvePlugins({
      ...baseOpts,
      plugins: [...(this.config.plugins || []), ...(opts.plugins || [])],
    });
    debug('initial presets:');
    debug(this.initialPresets);
    debug('initial plugins:');
    debug(this.initialPlugins);
  }

  setStage(stage: ServiceStage) {
    this.stage = stage;
  }

  resolvePackage() {
    try {
      return require(join(this.cwd, 'package.json'));
    } catch (e) {
      return {};
    }
  }

  getUserConfig() {
    // TODO: implement
    return {};
  }

  async init() {
    this.initPresetsAndPlugins();

    this.setStage(ServiceStage.initHooks);
    Object.keys(this.hooksByPluginId).forEach(id => {
      const hooks = this.hooksByPluginId[id];
      hooks.forEach(({ hook, fn }) => {
        this.hooks[hook] = (this.hooks[hook] || []).concat(fn);
      });
    });

    this.setStage(ServiceStage.validateUserConfig);
    // TODO: validate user config
  }

  initPresetsAndPlugins() {
    this.setStage(ServiceStage.initPresets);
    this._extraPresets = [...this.initialPresets];
    this._extraPlugins = [];
    while (this._extraPresets.length) {
      this.initPreset(this._extraPresets.shift()!);
    }

    this.setStage(ServiceStage.initPlugins);
    this._extraPlugins.push(...this.initialPlugins);
    while (this._extraPlugins.length) {
      this.initPlugin(this._extraPlugins.shift()!);
    }
  }

  initPreset(preset: IPreset) {
    const { id, key, apply } = preset;
    preset.isPreset = true;

    const api = new PluginAPI({ id, key, service: this });
    // register before apply
    this.registerPlugin(preset);
    const { presets, plugins, ...defaultConfigs } = apply()(api) || {};

    // TODO: api 可能不需要
    preset.api = api;

    // register extra presets and plugins
    if (presets) {
      assert(
        Array.isArray(presets),
        `presets returned from preset ${id} must be Array`,
      );
      this._extraPresets.splice(
        0,
        0,
        ...presets.map(pathToObj.bind(null, PluginType.preset)),
      );
    }
    if (plugins) {
      assert(
        Array.isArray(plugins),
        `plugins returned from preset ${id} must be Array`,
      );
      this._extraPlugins.push(
        ...plugins.map(pathToObj.bind(null, PluginType.plugin)),
      );
    }

    // TODO: register default config
  }

  initPlugin(plugin: IPlugin) {
    const { id, key, apply } = plugin;

    const api = new PluginAPI({ id, key, service: this });
    // register before apply
    this.registerPlugin(plugin);
    apply(api);

    // TODO: api 可能不需要
    plugin.api = api;
  }

  registerPlugin(plugin: IPlugin) {
    if (this.plugins[plugin.id]) {
      throw new Error(`\
plugin ${plugin.id} is already registered by ${this.plugins[plugin.id].path}, \
plugin from ${plugin.path} register failed.`);
    }
    this.plugins[plugin.id] = plugin;
  }

  applyPlugins(hook: string, opts: { initialValue: any; args: any }) {}

  async run() {
    this.stage = ServiceStage.run;
  }
}
