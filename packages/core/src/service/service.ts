import { lodash, yParser } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { join } from 'path';
import * as process from 'process';
import { AsyncSeriesWaterfallHook } from '../../compiled/tapable';
import { Config } from '../config/config';
import { DEFAULT_FRAMEWORK_NAME } from '../constants';
import {
  ApplyPluginsType,
  ConfigChangeType,
  EnableBy,
  Env,
  IEvent,
  IModify,
  PluginType,
  ServiceStage,
} from '../types';
import { Command } from './command';
import { loadEnv } from './env';
import { Hook } from './hook';
import { getPaths } from './path';
import { Plugin } from './plugin';
import { PluginAPI } from './pluginAPI';
import { isPromise } from './utils';

interface IOpts {
  cwd: string;
  env: Env;
  plugins?: string[];
  presets?: string[];
  frameworkName?: string;
  defaultConfigFiles?: string[];
}

export class Service {
  private opts: IOpts;
  appData: Record<string, any> = {};
  args: yParser.Arguments = { _: [], $0: '' };
  commands: Record<string, Command> = {};
  config: Record<string, any> = {};
  configSchemas: Record<string, any> = {};
  configDefaults: Record<string, any> = {};
  cwd: string;
  env: Env;
  hooks: Record<string, Hook[]> = {};
  name: string = '';
  paths: {
    cwd?: string;
    absSrcPath?: string;
    absPagesPath?: string;
    absTmpPath?: string;
    absNodeModulesPath?: string;
    absOutputPath?: string;
  } = {};
  // preset is plugin with different type
  plugins: Record<string, Plugin> = {};
  pluginMethods: Record<string, { plugin: Plugin; fn: Function }> = {};
  skipPluginIds: Set<string> = new Set<string>();
  stage: ServiceStage = ServiceStage.uninitialized;
  userConfig: Record<string, any> = {};
  configManager: Config | null = null;
  pkg: Record<string, string | Record<string, any>> = {};

  constructor(opts: IOpts) {
    this.cwd = opts.cwd;
    this.env = opts.env;
    this.opts = opts;
    assert(existsSync(this.cwd), `Invalid cwd ${this.cwd}, it's not found.`);
  }

  async applyPlugins<T>(opts: {
    key: string;
    type?: ApplyPluginsType;
    initialValue?: any;
    args?: any;
  }): Promise<T> {
    const hooks = this.hooks[opts.key] || [];
    let type = opts.type;
    // guess type from key
    if (!type) {
      if (opts.key.startsWith('on')) {
        type = ApplyPluginsType.event;
      } else if (opts.key.startsWith('modify')) {
        type = ApplyPluginsType.modify;
      } else if (opts.key.startsWith('add')) {
        type = ApplyPluginsType.add;
      } else {
        throw new Error(
          `Invalid applyPlugins arguments, type must be supplied for key ${opts.key}.`,
        );
      }
    }
    switch (type) {
      case ApplyPluginsType.add:
        assert(
          !('initialValue' in opts) || Array.isArray(opts.initialValue),
          `applyPlugins failed, opts.initialValue must be Array if opts.type is add.`,
        );
        const tAdd = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          if (!this.isPluginEnable(hook)) continue;
          tAdd.tapPromise(
            {
              name: hook.plugin.id,
              stage: hook.stage,
              before: hook.before,
            },
            async (memo: any) => {
              const items = await hook.fn(opts.args);
              return memo.concat(items);
            },
          );
        }
        return (await tAdd.promise(opts.initialValue || [])) as T;
      case ApplyPluginsType.modify:
        const tModify = new AsyncSeriesWaterfallHook(['memo']);
        for (const hook of hooks) {
          if (!this.isPluginEnable(hook)) continue;
          tModify.tapPromise(
            {
              name: hook.plugin.id,
              stage: hook.stage,
              before: hook.before,
            },
            async (memo: any) => {
              return await hook.fn(memo, opts.args);
            },
          );
        }
        return (await tModify.promise(opts.initialValue)) as T;
      case ApplyPluginsType.event:
        const tEvent = new AsyncSeriesWaterfallHook(['_']);
        for (const hook of hooks) {
          if (!this.isPluginEnable(hook)) continue;
          tEvent.tapPromise(
            {
              name: hook.plugin.id,
              stage: hook.stage || 0,
              before: hook.before,
            },
            async () => {
              await hook.fn(opts.args);
            },
          );
        }
        return (await tEvent.promise(1)) as T;
      default:
        throw new Error(
          `applyPlugins failed, type is not defined or is not matched, got ${opts.type}.`,
        );
    }
  }

  async run(opts: { name: string; args?: any }) {
    const { name, args = {} } = opts;
    args._ = args._ || [];
    // shift the command itself
    if (args._[0] === name) args._.shift();
    this.args = args;
    this.name = name;

    // loadEnv
    this.stage = ServiceStage.init;
    loadEnv({ cwd: this.cwd, envFile: '.env' });
    // get pkg from package.json
    let pkg: Record<string, string | Record<string, any>> = {};
    try {
      pkg = require(join(this.cwd, 'package.json'));
    } catch (_e) {
      // APP_ROOT
      if (this.cwd !== process.cwd()) {
        try {
          pkg = require(join(process.cwd(), 'package.json'));
        } catch (_e) {}
      }
    }
    this.pkg = pkg;
    // get user config
    const configManager = new Config({
      cwd: this.cwd,
      env: this.env,
      defaultConfigFiles: this.opts.defaultConfigFiles,
    });
    this.configManager = configManager;
    this.userConfig = configManager.getUserConfig().config;
    // get paths (move after?)
    // resolve initial presets and plugins
    const { plugins, presets } = Plugin.getPluginsAndPresets({
      cwd: this.cwd,
      pkg,
      plugins: this.opts.plugins || [],
      presets: [require.resolve('./servicePlugin')].concat(
        this.opts.presets || [],
      ),
      userConfig: this.userConfig,
      prefix: this.opts.frameworkName || DEFAULT_FRAMEWORK_NAME,
    });
    // register presets and plugins
    this.stage = ServiceStage.initPresets;
    while (presets.length) {
      await this.initPreset({ preset: presets.shift()!, presets, plugins });
    }
    this.stage = ServiceStage.initPlugins;
    while (plugins.length) {
      await this.initPlugin({ plugin: plugins.shift()!, plugins });
    }
    // collect configSchemas and configDefaults
    for (const id of Object.keys(this.plugins)) {
      const { config, key } = this.plugins[id];
      if (config.schema) this.configSchemas[key] = config.schema;
      if (config.default !== undefined) {
        this.configDefaults[key] = config.default;
      }
    }
    // setup api.config from modifyConfig and modifyDefaultConfig
    this.stage = ServiceStage.resolveConfig;
    const config = await this.applyPlugins({
      key: 'modifyConfig',
      initialValue: configManager.getConfig({
        schemas: this.configSchemas,
      }).config,
    });
    const defaultConfig = await this.applyPlugins({
      key: 'modifyDefaultConfig',
      initialValue: this.configDefaults,
    });
    this.config = lodash.merge(defaultConfig, config) as Record<string, any>;
    const paths = getPaths({
      cwd: this.cwd,
      env: this.env,
      prefix: this.opts.frameworkName || DEFAULT_FRAMEWORK_NAME,
    });
    if (this.config.outputPath) {
      paths.absOutputPath = join(this.cwd, this.config.outputPath);
    }
    this.paths = await this.applyPlugins({
      key: 'modifyPaths',
      initialValue: paths,
    });
    // applyPlugin collect app data
    // TODO: some data is mutable
    this.stage = ServiceStage.collectAppData;
    this.appData = await this.applyPlugins({
      key: 'modifyAppData',
      initialValue: {
        // base
        cwd: this.cwd,
        pkg,
        plugins,
        presets,
        name,
        args,
        // config
        userConfig: this.userConfig,
        mainConfigFile: configManager.mainConfigFile,
        config,
        defaultConfig: defaultConfig,
        // TODO
        // moduleGraph,
        // routes,
        // npmClient,
        // nodeVersion,
        // gitInfo,
        // gitBranch,
        // debugger info,
        // devPort,
        // devHost,
        // env
      },
    });
    // applyPlugin onCheck
    this.stage = ServiceStage.onCheck;
    await this.applyPlugins({
      key: 'onCheck',
    });
    // applyPlugin onStart
    this.stage = ServiceStage.onStart;
    await this.applyPlugins({
      key: 'onStart',
    });
    // run command
    this.stage = ServiceStage.runCommand;
    const command = this.commands[name];
    assert(command, `Invalid command ${name}, it's not registered.`);
    return command.fn({ args });
  }

  async initPreset(opts: {
    preset: Plugin;
    presets: Plugin[];
    plugins: Plugin[];
  }) {
    const { presets, plugins } = await this.initPlugin({
      plugin: opts.preset,
      presets: opts.presets,
      plugins: opts.plugins,
    });
    opts.presets.unshift(...(presets || []));
    opts.plugins.unshift(...(plugins || []));
  }

  async initPlugin(opts: {
    plugin: Plugin;
    presets?: Plugin[];
    plugins: Plugin[];
  }) {
    // register to this.plugins
    assert(
      !this.plugins[opts.plugin.id],
      `${opts.plugin.type} ${opts.plugin.id} is already registered by ${
        this.plugins[opts.plugin.id]?.path
      }, ${opts.plugin.type} from ${opts.plugin.path} register failed.`,
    );
    this.plugins[opts.plugin.id] = opts.plugin;

    // apply with PluginAPI
    const pluginAPI = new PluginAPI({
      plugin: opts.plugin,
      service: this,
    });
    pluginAPI.registerPresets = pluginAPI.registerPresets.bind(
      pluginAPI,
      opts.presets || [],
    );
    pluginAPI.registerPlugins = pluginAPI.registerPlugins.bind(
      pluginAPI,
      opts.plugins,
    );
    const proxyPluginAPI = PluginAPI.proxyPluginAPI({
      service: this,
      pluginAPI,
      serviceProps: [
        'appData',
        'applyPlugins',
        'args',
        'config',
        'cwd',
        'pkg',
        'name',
        'paths',
        'userConfig',
      ],
      staticProps: {
        ApplyPluginsType,
        ConfigChangeType,
        EnableBy,
        ServiceStage,
        service: this,
      },
    });
    let ret = opts.plugin.apply()(proxyPluginAPI);
    if (isPromise(ret)) {
      ret = await ret;
    }
    if (ret?.presets) {
      ret.presets = ret.presets.map(
        (preset: string) =>
          new Plugin({
            path: preset,
            type: PluginType.preset,
            cwd: this.cwd,
          }),
      );
    }
    if (ret?.plugins) {
      ret.plugins = ret.plugins.map(
        (plugin: string) =>
          new Plugin({
            path: plugin,
            type: PluginType.plugin,
            cwd: this.cwd,
          }),
      );
    }
    return ret || {};
  }

  isPluginEnable(hook: Hook) {
    const { id, key, enableBy } = hook.plugin;
    if (this.skipPluginIds.has(id)) return false;
    if (this.userConfig[key] === false) return false;
    if (enableBy === EnableBy.config && !(key in this.config)) return false;
    if (typeof enableBy === 'function') return enableBy();
    // EnableBy.register
    return true;
  }
}

// TODO: more props
export interface IServicePluginAPI {
  appData: typeof Service.prototype.appData;
  applyPlugins: typeof Service.prototype.applyPlugins;
  args: typeof Service.prototype.args;
  config: typeof Service.prototype.config;
  cwd: typeof Service.prototype.cwd;
  pkg: typeof Service.prototype.pkg;
  name: typeof Service.prototype.name;
  paths: Required<typeof Service.prototype.paths>;
  userConfig: typeof Service.prototype.userConfig;

  onCheck: IEvent<null>;
  onStart: IEvent<null>;
  modifyAppData: IModify<typeof Service.prototype.appData, null>;
  modifyConfig: IModify<typeof Service.prototype.config, null>;
  modifyDefaultConfig: IModify<typeof Service.prototype.config, null>;
  modifyPaths: IModify<typeof Service.prototype.paths, null>;

  ApplyPluginsType: typeof ApplyPluginsType;
  ConfigChangeType: typeof ConfigChangeType;
  EnableBy: typeof EnableBy;
  ServiceStage: typeof ServiceStage;

  registerPlugins: (plugins: (Plugin | {})[]) => void;
}
