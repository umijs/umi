var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { assert, compose, isPromiseLike } from './utils';
export var ApplyPluginsType;
(function (ApplyPluginsType) {
    ApplyPluginsType["compose"] = "compose";
    ApplyPluginsType["modify"] = "modify";
    ApplyPluginsType["event"] = "event";
})(ApplyPluginsType || (ApplyPluginsType = {}));
export class PluginManager {
    constructor(opts) {
        this.hooks = {};
        this.opts = opts;
    }
    register(plugin) {
        assert(plugin.apply && plugin.path, `plugin register failed, apply and path must supplied`);
        Object.keys(plugin.apply).forEach((key) => {
            assert(this.opts.validKeys.indexOf(key) > -1, `register failed, invalid key ${key} from plugin ${plugin.path}.`);
            this.hooks[key] = (this.hooks[key] || []).concat(plugin.apply[key]);
        });
    }
    getHooks(keyWithDot) {
        const [key, ...memberKeys] = keyWithDot.split('.');
        let hooks = this.hooks[key] || [];
        if (memberKeys.length) {
            hooks = hooks
                .map((hook) => {
                try {
                    let ret = hook;
                    for (const memberKey of memberKeys) {
                        ret = ret[memberKey];
                    }
                    return ret;
                }
                catch (e) {
                    return null;
                }
            })
                .filter(Boolean);
        }
        return hooks;
    }
    applyPlugins({ key, type, initialValue, args, async, }) {
        const hooks = this.getHooks(key) || [];
        if (args) {
            assert(typeof args === 'object', `applyPlugins failed, args must be plain object.`);
        }
        if (async) {
            assert(type === ApplyPluginsType.modify || type === ApplyPluginsType.event, `async only works with modify and event type.`);
        }
        switch (type) {
            case ApplyPluginsType.modify:
                if (async) {
                    return hooks.reduce((memo, hook) => __awaiter(this, void 0, void 0, function* () {
                        assert(typeof hook === 'function' ||
                            typeof hook === 'object' ||
                            isPromiseLike(hook), `applyPlugins failed, all hooks for key ${key} must be function, plain object or Promise.`);
                        if (isPromiseLike(memo)) {
                            memo = yield memo;
                        }
                        if (typeof hook === 'function') {
                            const ret = hook(memo, args);
                            if (isPromiseLike(ret)) {
                                return yield ret;
                            }
                            else {
                                return ret;
                            }
                        }
                        else {
                            if (isPromiseLike(hook)) {
                                hook = yield hook;
                            }
                            return Object.assign(Object.assign({}, memo), hook);
                        }
                    }), isPromiseLike(initialValue)
                        ? initialValue
                        : Promise.resolve(initialValue));
                }
                else {
                    return hooks.reduce((memo, hook) => {
                        assert(typeof hook === 'function' || typeof hook === 'object', `applyPlugins failed, all hooks for key ${key} must be function or plain object.`);
                        if (typeof hook === 'function') {
                            return hook(memo, args);
                        }
                        else {
                            // TODO: deepmerge?
                            return Object.assign(Object.assign({}, memo), hook);
                        }
                    }, initialValue);
                }
            case ApplyPluginsType.event:
                return (() => __awaiter(this, void 0, void 0, function* () {
                    for (const hook of hooks) {
                        assert(typeof hook === 'function', `applyPlugins failed, all hooks for key ${key} must be function.`);
                        const ret = hook(args);
                        if (async && isPromiseLike(ret)) {
                            yield ret;
                        }
                    }
                }))();
            case ApplyPluginsType.compose:
                return () => {
                    return compose({
                        fns: hooks.concat(initialValue),
                        args,
                    })();
                };
        }
    }
    static create(opts) {
        const pluginManager = new PluginManager({
            validKeys: opts.validKeys,
        });
        opts.plugins.forEach((plugin) => {
            pluginManager.register(plugin);
        });
        return pluginManager;
    }
}
// plugins meta info (in tmp file)
// hooks api: usePlugin
