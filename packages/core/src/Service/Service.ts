import { join } from 'path';
import assert from 'assert';
import { BabelRegister, createDebug, NodeEnv } from '@umijs/utils';
import { AsyncSeriesWaterfallHook } from 'tapable';
import { existsSync } from 'fs';
import { pathToObj, resolvePlugins, resolvePresets } from './utils/pluginUtils';
import PluginAPI from './PluginAPI';
import { ApplyPluginsType, PluginType, ServiceStage } from './enums';
import { ICommand, IHook, IPackage, IPlugin, IPreset } from './types';
import Config from '../Config/Config';
import { getUserConfigWithKey } from '../Config/utils/configUtils';
import getPaths from './getPaths';

const debug = createDebug('umi:core:Service');

export interface IServiceOpts {
  cwd: string;
  presets?: string[];
  plugins?: string[];
  env?: NodeEnv;
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
// 4. duplicated key
export default class Service {
  cwd: string;
  pkg: IPackage;
  skipPluginIds: Set<string> = new Set<string>();
  // lifecycle stage
  stage: ServiceStage = ServiceStage.uninitiialized;
  // registered commands
  commands: {
    [name: string]: ICommand | string;
  } = {};
  // including presets and plugins
  plugins: {
    [id: string]: IPlugin;
  } = {};
  // plugin methods
  pluginMethods: {
    [name: string]: Function;
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
    cwd?: string;
    absNodeModulesPath?: string;
    absSrcPath?: string;
    absPagesPath?: string;
    absOutputPath?: string;
    absTmpPath?: string;
    aliasedTmpPath?: string;
  } = {};
  env: string | undefined;
  ApplyPluginsType = ApplyPluginsType;
  ServiceStage = ServiceStage;

  constructor(opts: IServiceOpts) {
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

    // get paths
    this.paths = getPaths({
      cwd: this.cwd,
      config: this.userConfig!,
      env: this.env,
    });

    // setup initial presets and plugins
    const baseOpts = {
      pkg: this.pkg,
      cwd: this.cwd,
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
    this.applyPlugins({
      key: 'onPluginReady',
      type: ApplyPluginsType.event,
    });

    // get config, including:
    // 1. merge default config
    // 2. validate
    this.setStage(ServiceStage.getConfig);
    // TODO: 支持修改用户默认配置，或者直接修改用户配置
    this.config = this.configInstance.getConfig() as any;

    // merge paths to keep the this.paths ref
    this.setStage(ServiceStage.getPaths);
    const paths = (await this.applyPlugins({
      key: 'modifyPaths',
      type: ApplyPluginsType.modify,
      initialValue: this.paths,
    })) as object;
    Object.keys(paths).forEach(key => {
      this.paths[key] = paths[key];
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

  getPluginAPI(opts: any) {
    const pluginAPI = new PluginAPI(opts);

    // register built-in methods
    ['onPluginReady', 'modifyPaths', 'onStart'].forEach(name => {
      pluginAPI.registerMethod({ name, exitsError: false });
    });

    return new Proxy(pluginAPI, {
      get: (target, prop: string) => {
        // 由于 pluginMethods 需要在 register 阶段可用
        // 必须通过 proxy 的方式动态获取最新，以实现边注册边使用的效果
        if (this.pluginMethods[prop]) return this.pluginMethods[prop];
        if (
          [
            'applyPlugins',
            'ApplyPluginsType',
            'ServiceStage',
            'paths',
            'cwd',
            'pkg',
            'config',
            'env',
          ].includes(prop)
        ) {
          return typeof this[prop] === 'function'
            ? this[prop].bind(this)
            : this[prop];
        }
        return target[prop];
      },
    });
  }

  initPreset(preset: IPreset) {
    const { id, key, apply } = preset;
    preset.isPreset = true;

    const api = this.getPluginAPI({ id, key, service: this });

    // register before apply
    this.registerPlugin(preset);
    // TODO: ...defaultConfigs 考虑要不要支持，可能这个需求可以通过其他渠道实现
    const { presets, plugins, ...defaultConfigs } =
      apply()(api, this.getPluginOptsWithKey(key)) || {};

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
  }

  initPlugin(plugin: IPlugin) {
    const { id, key, apply } = plugin;

    const api = this.getPluginAPI({ id, key, service: this });

    // register before apply
    this.registerPlugin(plugin);
    apply()(api, this.getPluginOptsWithKey(key));
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
    type: ApplyPluginsType;
    initialValue?: any;
    args?: any;
  }) {
    const hooks = this.hooks[opts.key] || [];
    switch (opts.type) {
      case ApplyPluginsType.add:
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
      case ApplyPluginsType.modify:
        const tModify = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          tModify.tapPromise(hook.pluginId!, async memo => {
            return await hook.fn(memo, opts.args);
          });
        }
        return await tModify.promise(opts.initialValue);
      case ApplyPluginsType.event:
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

  async run({ name, args = {} }: { name: string; args?: any }) {
    this.setStage(ServiceStage.init);
    await this.init();

    this.stage = ServiceStage.run;
    const command =
      typeof this.commands[name] === 'string'
        ? this.commands[this.commands[name] as string]
        : this.commands[name];
    assert(command, `run command failed, command ${name} does not exists.`);

    args._ = args._ || [];
    // shift the command itself
    args._.shift();

    await this.applyPlugins({
      key: 'onStart',
      type: ApplyPluginsType.event,
      args: {
        args,
      },
    });

    const { fn } = command as ICommand;
    return await fn({ args });
  }
}
