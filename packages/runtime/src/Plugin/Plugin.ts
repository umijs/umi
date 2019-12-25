import { assert } from '../utils';

export enum ApplyPluginsType {
  compose = 'compose',
  modify = 'modify',
  event = 'event',
}

interface IPlugin {
  path?: string;
  apply: object;
}

interface IOpts {
  validKeys?: string[];
}

function _compose({ fns, args }: { fns: (Function | any)[]; args?: object }) {
  if (fns.length === 1) {
    return fns[0];
  }
  const last = fns.pop();
  return fns.reduce((a, b) => () => b(a, args), last);
}

export default class Plugin {
  validKeys: string[];
  hooks: {
    [key: string]: any;
  } = {};

  constructor(opts?: IOpts) {
    this.validKeys = opts?.validKeys || [];
  }

  register(plugin: IPlugin) {
    assert(!!plugin.apply, `register failed, plugin.apply must supplied`);
    assert(!!plugin.path, `register failed, plugin.path must supplied`);
    Object.keys(plugin.apply).forEach(key => {
      assert(
        this.validKeys.indexOf(key) > -1,
        `register failed, invalid key ${key} from plugin ${plugin.path}.`,
      );
      if (!this.hooks[key]) this.hooks[key] = [];
      this.hooks[key] = this.hooks[key].concat(plugin.apply[key]);
    });
  }

  getHooks(keyWithDot: string) {
    const [key, ...memberKeys] = keyWithDot.split('.');
    let hooks = this.hooks[key];
    if (memberKeys.length) {
      hooks = hooks
        .map((hook: any) => {
          try {
            let ret = hook;
            for (const memberKey of memberKeys) {
              ret = ret[memberKey];
            }
            return ret;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    }
    return hooks;
  }

  applyPlugins({
    key,
    type,
    initialValue,
    args,
  }: {
    key: string;
    type: ApplyPluginsType;
    initialValue?: any;
    args?: object;
  }) {
    const hooks = this.getHooks(key) || [];

    if (args) {
      assert(
        typeof args === 'object',
        `applyPlugins failed, args must be plain object.`,
      );
    }

    switch (type) {
      case ApplyPluginsType.modify:
        return hooks.reduce((memo: any, hook: Function | object) => {
          assert(
            typeof hook === 'function' || typeof hook === 'object',
            `applyPlugins failed, all hooks for key ${key} must be function or plain object.`,
          );
          if (typeof hook === 'function') {
            return hook(memo, args);
          } else {
            // TODO: deepmerge?
            return { ...memo, ...hook };
          }
        }, initialValue);

      case ApplyPluginsType.event:
        return hooks.forEach((hook: Function) => {
          assert(
            typeof hook === 'function',
            `applyPlugins failed, all hooks for key ${key} must be function.`,
          );
          hook(args);
        });

      case ApplyPluginsType.compose:
        return () => {
          return _compose({
            fns: hooks.concat(initialValue),
            args,
          })();
        };
    }
  }
}
