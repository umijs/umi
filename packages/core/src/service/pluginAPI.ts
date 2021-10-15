import { lodash } from '@umijs/utils';
import assert from 'assert';
import { EnableBy, IPluginConfig, PluginType, ServiceStage } from '../types';
import { Command, IOpts as ICommandOpts } from './command';
import { Hook, IOpts as IHookOpts } from './hook';
import { Plugin } from './plugin';
import { Service } from './service';
import { makeArray } from './utils';

export class PluginAPI {
  service: Service;
  plugin: Plugin;
  constructor(opts: { service: Service; plugin: Plugin }) {
    this.service = opts.service;
    this.plugin = opts.plugin;
    // TODO
    // logger
  }

  describe(opts: {
    key?: string;
    config?: IPluginConfig;
    enableBy?: EnableBy | (() => boolean);
  }) {
    this.plugin.merge(opts);
  }

  registerCommand(
    opts: Omit<ICommandOpts, 'plugin'> & { alias?: string | string[] },
  ) {
    const { name, alias } = opts;
    delete opts.alias;
    const registerCommand = (commandOpts: Omit<typeof opts, 'alias'>) => {
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

  register(opts: Omit<IHookOpts, 'plugin'>) {
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
        ((fn: Function | Object) => {
          this.register({
            key: opts.name,
            ...(lodash.isPlainObject(fn) ? (fn as any) : { fn }),
          });
        }),
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
          type: PluginType.plugin,
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

  skipPlugins(ids: string[]) {
    ids.forEach((id) => {
      this.service.skipPluginIds.add(id);
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
