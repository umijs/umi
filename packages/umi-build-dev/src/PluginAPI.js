import debug from 'debug';
import assert from 'assert';

export default class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.debug = debug(`umi-plugin: ${id}`);

    this.API_TYPE = {
      ADD: 'add',
      MODIFY: 'modify',
      EVENT: 'event',
    };
  }

  register(key, fn) {
    assert(
      typeof key === 'string',
      `The first argument of api.register() must be string, but got ${key}`,
    );
    assert(
      typeof fn === 'function',
      `The second argument of api.register() must be function, but got ${fn}`,
    );
    const { pluginHooks } = this.service;
    pluginHooks[key] = pluginHooks[key] || [];
    pluginHooks[key].push({
      fn,
    });
  }

  registerCommand(name, opts, fn) {
    const { commands } = this.service;
    if (typeof opts === 'function') {
      fn = opts;
      opts = null;
    }
    assert(
      !(name in commands),
      `Command ${name} exists, please select another one.`,
    );
    commands[name] = { fn, opts: opts || {} };
  }

  registerPlugin(opts) {
    // TODO: validate opts
  }

  registerMethod(hook, opts) {
    assert(!this[hook], `api.${hook} exists.`);
    assert(opts, `opts must supplied`);
    const { type, apply } = opts;
    assert(!(type && apply), `Only be one for type and apply.`);
    assert(type || apply, `One of type and apply must supplied.`);

    this.service.pluginMethods[hook] = (...args) => {
      if (apply) {
        apply(...args);
      } else if (type === this.API_TYPE.ADD) {
        this.register(hook, opts => {
          const { memo } = opts;
          return (memo || []).concat(
            typeof args[0] === 'function' ? args[0](opts) : args[0],
          );
        });
      } else if (type === this.API_TYPE.MODIFY) {
        this.register(hook, opts => {
          return args[0](opts);
        });
      } else if (type === this.API_TYPE.EVENT) {
        this.register(hook, opts => {
          args[0](opts);
        });
      } else {
        throw new Error(`unexpected api type ${type}`);
      }
    };
  }

  onOptionChange() {}
}
