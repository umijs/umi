import { join } from 'path';
import assert from 'assert';
import { createDebug } from '@umijs/utils';
import { AsyncSeriesWaterfallHook } from 'tapable';
import { pathToObj, resolvePlugins, resolvePresets } from './utils/pluginUtils';
import PluginAPI from './PluginAPI';
import { IApplyPluginsType, PluginType, ServiceStage } from './enums';

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
  // hooks
  hooksByPluginId: {
    [id: string]: IHook[];
  } = {};
  hooks: {
    [key: string]: IHook[];
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
      hooks.forEach(hook => {
        const { key } = hook;
        hook.pluginId = id;
        this.hooks[key] = (this.hooks[key] || []).concat(hook);
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
    apply()(api);

    // TODO: api 可能不需要
    plugin.api = api;
  }

  registerPlugin(plugin: IPlugin) {
    // 考虑要不要去掉这里的校验逻辑
    // 理论上不会走到这里，因为在 describe 的时候已经做了冲突校验
    if (this.plugins[plugin.id]) {
      const name = plugin.isPreset ? 'preset' : 'plugin';
      throw new Error(`\
${name} ${plugin.id} is already registered by ${this.plugins[plugin.id].path}, \
${name} from ${plugin.path} register failed.`);
    }
    this.plugins[plugin.id] = plugin;
  }

  async applyPlugins(opts: {
    key: string;
    type: IApplyPluginsType;
    initialValue?: any;
    args?: any;
  }) {
    const hooks = this.hooks[opts.key];
    switch (opts.type) {
      case IApplyPluginsType.add:
        if ('initialValue' in opts) {
          assert(
            Array.isArray(opts.initialValue),
            `applyPlugins failed, opts.initialValue must be Array if opts.type is add`,
          );
        }
        const tAdd = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          tAdd.tapPromise(hook.pluginId, async memo => {
            const items = await hook.fn(opts.args);
            return memo.concat(items);
          });
        }
        return await tAdd.promise(opts.initialValue || []);
      case IApplyPluginsType.modify:
        const tModify = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          tModify.tapPromise(hook.pluginId, async memo => {
            return await hook.fn(memo, opts.args);
          });
        }
        return await tModify.promise(opts.initialValue);
      case IApplyPluginsType.event:
        const tEvent = new AsyncSeriesWaterfallHook(['_']);
        for (const hook of hooks) {
          tEvent.tapPromise(hook.pluginId, async () => {
            await hook.fn(opts.args);
          });
        }
        return await tEvent.promise();
      default:
        throw new Error(
          `applyPlugin failed, type is not defined or is not matched, got ${opts.type}`,
        );
    }
  }

  async run() {
    this.stage = ServiceStage.run;
  }
}
