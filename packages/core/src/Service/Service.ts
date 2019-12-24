import { join } from 'path';
import assert from 'assert';
import { createDebug } from '@umijs/utils';
import { AsyncSeriesWaterfallHook } from 'tapable';
import { existsSync } from 'fs';
import { pathToObj, resolvePlugins, resolvePresets } from './utils/pluginUtils';
import PluginAPI from './PluginAPI';
import { IApplyPluginsType, PluginType, ServiceStage } from './enums';
import { ICommand, IHook, IPackage, IPlugin, IPreset } from './types';
import Config from '../Config/Config';
import BabelRegister from './BabelRegister';
import { getUserConfigWithKey } from '../Config/utils/configUtils';
import getPaths from './getPaths';

const debug = createDebug('umi:core:Service');

interface IOpts {
  cwd: string;
  presets?: string[];
  plugins?: string[];
  useBuiltIn?: boolean;
  env?: 'development' | 'production' | 'test';
}

interface IConfig {
  presets?: string[];
  plugins?: string[];
  [key: string]: any;
}

// TODO
// 1. load env
// 2. onOptionChange
// 3. watch mode
// 4. getPaths
// 5. duplicated key
export default class Service {
  cwd: string;
  pkg: IPackage;
  skipPluginIds: Set<string> = new Set<string>();
  // lifecycle stage
  stage: ServiceStage = ServiceStage.uninitiialized;
  // registered commands
  commands: {
    [name: string]: ICommand;
  } = {};
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
  userConfig: IConfig;
  configInstance: Config;
  config: IConfig | null = null;
  // babel register
  babelRegister: BabelRegister;
  // hooks
  hooksByPluginId: {
    [id: string]: IHook[];
  } = {};
  hooks: {
    [key: string]: IHook[];
  } = {};
  // paths
  paths: {
    [key: string]: string;
  } = {};
  env: string | undefined;

  constructor(opts: IOpts) {
    debug('opts:');
    debug(opts);
    this.cwd = opts.cwd || process.cwd();
    this.pkg = this.resolvePackage();
    this.env = opts.env || process.env.NODE_ENV;

    assert(existsSync(this.cwd), `cwd ${this.cwd} does not exist.`);

    // register babel before config parsing
    this.babelRegister = new BabelRegister();

    // get user config without validation
    this.configInstance = new Config({
      cwd: this.cwd,
      service: this,
      localConfig: this.env === 'development',
    });
    this.userConfig = this.configInstance.getUserConfig();

    // setup initial presets and plugins
    const baseOpts = {
      pkg: this.pkg,
      cwd: this.cwd,
      useBuiltIn: Boolean(opts.useBuiltIn),
    };
    this.initialPresets = resolvePresets({
      ...baseOpts,
      presets: [...(this.userConfig.presets || []), ...(opts.presets || [])],
    });
    this.initialPlugins = resolvePlugins({
      ...baseOpts,
      plugins: [...(this.userConfig.plugins || []), ...(opts.plugins || [])],
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

  async init() {
    // after init presets and plugins
    // we should have the final hooksByPluginId which is added with api.register()
    this.initPresetsAndPlugins();

    // collect false configs, then add to this.skipPluginIds
    // skipPluginIds include two parts:
    // 1. api.skipPlugins()
    // 2. user config with the `false` value
    Object.keys(this.hooksByPluginId).forEach(pluginId => {
      const { key } = this.plugins[pluginId];
      if (this.getPluginOptsWithKey(key) === false) {
        this.skipPluginIds.add(pluginId);
      }
    });

    // delete hooks from this.hooksByPluginId with this.skipPluginIds
    for (const pluginId of this.skipPluginIds) {
      if (this.hooksByPluginId[pluginId]) delete this.hooksByPluginId[pluginId];
    }

    // hooksByPluginId -> hooks
    // hooks is mapped with hook key, prepared for applyPlugins()
    this.setStage(ServiceStage.initHooks);
    Object.keys(this.hooksByPluginId).forEach(id => {
      const hooks = this.hooksByPluginId[id];
      hooks.forEach(hook => {
        const { key } = hook;
        hook.pluginId = id;
        this.hooks[key] = (this.hooks[key] || []).concat(hook);
      });
    });

    // plugin is totally ready
    this.setStage(ServiceStage.pluginReady);

    // get config, including:
    // 1. merge default config
    // 2. validate
    this.setStage(ServiceStage.getConfig);
    this.config = this.configInstance.getConfig() as any;

    this.setStage(ServiceStage.getPaths);
    this.paths = getPaths({
      cwd: this.cwd,
      config: this.config!,
      env: this.env,
    });
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
    // TODO: ...defaultConfigs 考虑要不要支持，可能这个需求可以通过其他渠道实现
    const { presets, plugins, ...defaultConfigs } =
      apply()(api, this.getPluginOptsWithKey(key)) || {};

    // TODO: api 可能不需要
    // preset.api = api;

    // register extra presets and plugins
    if (presets) {
      assert(
        Array.isArray(presets),
        `presets returned from preset ${id} must be Array.`,
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
        `plugins returned from preset ${id} must be Array.`,
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
    apply()(api, this.getPluginOptsWithKey(key));

    // TODO: api 可能不需要
    // plugin.api = api;
  }

  getPluginOptsWithKey(key: string) {
    return getUserConfigWithKey({
      key,
      userConfig: this.userConfig,
    });
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
            `applyPlugins failed, opts.initialValue must be Array if opts.type is add.`,
          );
        }
        const tAdd = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          tAdd.tapPromise(hook.pluginId!, async memo => {
            const items = await hook.fn(opts.args);
            return memo.concat(items);
          });
        }
        return await tAdd.promise(opts.initialValue || []);
      case IApplyPluginsType.modify:
        const tModify = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          tModify.tapPromise(hook.pluginId!, async memo => {
            return await hook.fn(memo, opts.args);
          });
        }
        return await tModify.promise(opts.initialValue);
      case IApplyPluginsType.event:
        const tEvent = new AsyncSeriesWaterfallHook(['_']);
        for (const hook of hooks) {
          tEvent.tapPromise(hook.pluginId!, async () => {
            await hook.fn(opts.args);
          });
        }
        return await tEvent.promise();
      default:
        throw new Error(
          `applyPlugin failed, type is not defined or is not matched, got ${opts.type}.`,
        );
    }
  }

  async run({
    name,
    args,
    rawArgs,
  }: {
    name: string;
    args?: any;
    rawArgs?: string;
  }) {
    this.setStage(ServiceStage.init);
    this.init();

    args._ = args._ || [];

    this.stage = ServiceStage.run;
    const command = this.commands[name];

    assert(command, `run command failed, command ${name} does not exists.`);
    const { fn } = command;

    // shift the command itself
    args._.shift();

    return await fn({ args });
  }
}
