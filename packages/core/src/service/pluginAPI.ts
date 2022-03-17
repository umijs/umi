import { chalk, lodash, logger } from '@umijs/utils';
import assert from 'assert';
import {
  EnableBy,
  Env,
  IPluginConfig,
  PluginType,
  ServiceStage,
} from '../types';
import { Command, IOpts as ICommandOpts } from './command';
import { Generator, IGeneratorOpts } from './generator';
import { Hook, IOpts as IHookOpts } from './hook';
import { Plugin } from './plugin';
import { Service } from './service';
import { makeArray } from './utils';

type Logger = typeof logger;

export class PluginAPI {
  service: Service;
  plugin: Plugin;
  logger: Logger;
  constructor(opts: { service: Service; plugin: Plugin }) {
    this.service = opts.service;
    this.plugin = opts.plugin;
    // logger
    const loggerKeys: (keyof Logger)[] = [
      'wait',
      'error',
      'warn',
      'ready',
      'info',
      'event',
    ];
    // @ts-ignore
    this.logger = loggerKeys.reduce<Logger>((memo, key) => {
      // @ts-ignore
      memo[key] = (...message: string[]) => {
        // @ts-ignore
        logger[key](chalk.green(`[plugin: ${this.plugin.id}]`), ...message);
      };
      return memo;
    }, {} as any);
  }

  describe(opts: {
    key?: string;
    config?: IPluginConfig;
    enableBy?:
      | EnableBy
      | ((enableByOpts: { userConfig: any; env: Env }) => boolean);
  }) {
    // default 值 + 配置开启冲突，会导致就算用户没有配 key，插件也会生效
    if (opts.enableBy === EnableBy.config && opts.config?.default) {
      throw new Error(
        `[plugin: ${this.plugin.id}] The config.default is not allowed when enableBy is EnableBy.config.`,
      );
    }
    this.plugin.merge(opts);
  }

  registerCommand(
    opts: Omit<ICommandOpts, 'plugin'> & { alias?: string | string[] },
  ) {
    const { alias } = opts;
    delete opts.alias;
    const registerCommand = (commandOpts: Omit<typeof opts, 'alias'>) => {
      const { name } = commandOpts;
      assert(
        !this.service.commands[name],
        `api.registerCommand() failed, the command ${name} is exists from ${this.service.commands[name]?.plugin.id}.`,
      );
      this.service.commands[name] = new Command({
        ...commandOpts,
        plugin: this.plugin,
      });
    };
    registerCommand(opts);
    if (alias) {
      const aliases = makeArray(alias);
      aliases.forEach((alias) => {
        registerCommand({ ...opts, name: alias });
      });
    }
  }

  registerGenerator(opts: Omit<IGeneratorOpts, 'plugin'>) {
    const { key } = opts;
    assert(
      !this.service.generators[key],
      `api.registerGenerator() failed, the generator ${key} is exists from ${this.service.generators[key]?.plugin.id}.`,
    );
    this.service.generators[key] = new Generator({
      ...opts,
      plugin: this.plugin,
    });
  }

  register(opts: Omit<IHookOpts, 'plugin'>) {
    assert(
      this.service.stage <= ServiceStage.initPlugins,
      'api.register() should not be called after plugin register stage.',
    );
    this.service.hooks[opts.key] ||= [];
    this.service.hooks[opts.key].push(
      new Hook({ ...opts, plugin: this.plugin }),
    );
  }

  registerMethod(opts: { name: string; fn?: Function }) {
    assert(
      !this.service.pluginMethods[opts.name],
      `api.registerMethod() failed, method ${opts.name} is already exist.`,
    );
    this.service.pluginMethods[opts.name] = {
      plugin: this.plugin,
      fn:
        opts.fn ||
        // 这里不能用 arrow function，this 需指向执行此方法的 PluginAPI
        // 否则 pluginId 会不会，导致不能正确 skip plugin
        function (fn: Function | Object) {
          // @ts-ignore
          this.register({
            key: opts.name,
            ...(lodash.isPlainObject(fn) ? (fn as any) : { fn }),
          });
        },
    };
  }

  registerPresets(source: Plugin[], presets: any[]) {
    assert(
      this.service.stage === ServiceStage.initPresets,
      `api.registerPresets() failed, it should only used in presets.`,
    );
    source.splice(
      0,
      0,
      ...presets.map((preset) => {
        return new Plugin({
          path: preset,
          cwd: this.service.cwd,
          type: PluginType.preset,
        });
      }),
    );
  }

  registerPlugins(source: Plugin[], plugins: any[]) {
    assert(
      this.service.stage === ServiceStage.initPresets ||
        this.service.stage === ServiceStage.initPlugins,
      `api.registerPlugins() failed, it should only be used in registering stage.`,
    );
    const mappedPlugins = plugins.map((plugin) => {
      if (lodash.isPlainObject(plugin)) {
        assert(
          plugin.id && plugin.key,
          `Invalid plugin object, id and key must supplied.`,
        );
        plugin.type = PluginType.plugin;
        plugin.enableBy = plugin.enableBy || EnableBy.register;
        plugin.apply = plugin.apply || (() => () => {});
        plugin.config = plugin.config || {};
        plugin.time = { hooks: {} };
        return plugin;
      } else {
        return new Plugin({
          path: plugin,
          cwd: this.service.cwd,
          type: PluginType.plugin,
        });
      }
    });
    if (this.service.stage === ServiceStage.initPresets) {
      source.push(...mappedPlugins);
    } else {
      source.splice(0, 0, ...mappedPlugins);
    }
  }

  skipPlugins(keys: string[]) {
    keys.forEach((key) => {
      assert(!(this.plugin.key === key), `plugin ${key} can't skip itself!`);
      assert(
        this.service.keyToPluginMap[key],
        `key: ${key} is not be registered by any plugin. You can't skip it!`,
      );
      this.service.skipPluginIds.add(this.service.keyToPluginMap[key].id);
    });
  }

  static proxyPluginAPI(opts: {
    pluginAPI: PluginAPI;
    service: Service;
    serviceProps: string[];
    staticProps: Record<string, any>;
  }) {
    return new Proxy(opts.pluginAPI, {
      get: (target, prop: string) => {
        if (opts.service.pluginMethods[prop]) {
          return opts.service.pluginMethods[prop].fn;
        }
        if (opts.serviceProps.includes(prop)) {
          // @ts-ignore
          const serviceProp = opts.service[prop];
          return typeof serviceProp === 'function'
            ? serviceProp.bind(opts.service)
            : serviceProp;
        }
        if (prop in opts.staticProps) {
          return opts.staticProps[prop];
        }
        // @ts-ignore
        return target[prop];
      },
    });
  }
}
