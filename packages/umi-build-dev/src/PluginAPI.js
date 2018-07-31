import debug from 'debug';
import assert from 'assert';
import isPlainObject from 'is-plain-object';

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
    assert(isPlainObject(opts), `opts should be plain object, but got ${opts}`);
    const { id, apply } = opts;
    assert(id && apply, `id and apply must supplied`);
    assert(typeof id === 'string', `id must be string`);
    assert(typeof apply === 'function', `apply must be function`);
    assert(
      id.indexOf('user:') !== 0 && id.indexOf('built-in:') !== 0,
      `api.registerPlugin() should not register plugin prefixed with user: and built-in:`,
    );
    assert(
      Object.keys(opts).every(key => ['id', 'apply', 'opts'].includes(key)),
      `Only id, apply and opts is valid plugin properties`,
    );
    this.service.extraPlugins.push(opts);
  }

  registerMethod(hook, opts) {
    assert(!this[hook], `api.${hook} exists.`);
    assert(opts, `opts must supplied`);
    const { type, apply } = opts;
    assert(!(type && apply), `Only be one for type and apply.`);
    assert(type || apply, `One of type and apply must supplied.`);

    this.service.pluginMethods[hook] = (...args) => {
      if (apply) {
        this.register(hook, opts => {
          return apply(opts, ...args);
        });
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
}
