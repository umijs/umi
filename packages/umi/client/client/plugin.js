var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { assert, compose, isPromiseLike } from './utils';
export var ApplyPluginsType;
(function (ApplyPluginsType) {
    ApplyPluginsType["compose"] = "compose";
    ApplyPluginsType["modify"] = "modify";
    ApplyPluginsType["event"] = "event";
})(ApplyPluginsType || (ApplyPluginsType = {}));
var PluginManager = /** @class */ (function () {
    function PluginManager(opts) {
        this.hooks = {};
        this.opts = opts;
    }
    PluginManager.prototype.register = function (plugin) {
        var _this = this;
        assert(plugin.apply, "plugin register failed, apply must supplied");
        Object.keys(plugin.apply).forEach(function (key) {
            assert(_this.opts.validKeys.indexOf(key) > -1, "register failed, invalid key ".concat(key, " ").concat(plugin.path ? "from plugin ".concat(plugin.path) : '', "."));
            _this.hooks[key] = (_this.hooks[key] || []).concat(plugin.apply[key]);
        });
    };
    PluginManager.prototype.getHooks = function (keyWithDot) {
        var _a = keyWithDot.split('.'), key = _a[0], memberKeys = _a.slice(1);
        var hooks = this.hooks[key] || [];
        if (memberKeys.length) {
            hooks = hooks
                .map(function (hook) {
                try {
                    var ret = hook;
                    for (var _i = 0, memberKeys_1 = memberKeys; _i < memberKeys_1.length; _i++) {
                        var memberKey = memberKeys_1[_i];
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
    };
    PluginManager.prototype.applyPlugins = function (_a) {
        var _this = this;
        var key = _a.key, type = _a.type, initialValue = _a.initialValue, args = _a.args, async = _a.async;
        var hooks = this.getHooks(key) || [];
        if (args) {
            assert(typeof args === 'object', "applyPlugins failed, args must be plain object.");
        }
        if (async) {
            assert(type === ApplyPluginsType.modify || type === ApplyPluginsType.event, "async only works with modify and event type.");
        }
        switch (type) {
            case ApplyPluginsType.modify:
                if (async) {
                    return hooks.reduce(function (memo, hook) { return __awaiter(_this, void 0, void 0, function () {
                        var ret;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    assert(typeof hook === 'function' ||
                                        typeof hook === 'object' ||
                                        isPromiseLike(hook), "applyPlugins failed, all hooks for key ".concat(key, " must be function, plain object or Promise."));
                                    if (!isPromiseLike(memo)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, memo];
                                case 1:
                                    memo = _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!(typeof hook === 'function')) return [3 /*break*/, 6];
                                    ret = hook(memo, args);
                                    if (!isPromiseLike(ret)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, ret];
                                case 3: return [2 /*return*/, _a.sent()];
                                case 4: return [2 /*return*/, ret];
                                case 5: return [3 /*break*/, 9];
                                case 6:
                                    if (!isPromiseLike(hook)) return [3 /*break*/, 8];
                                    return [4 /*yield*/, hook];
                                case 7:
                                    hook = _a.sent();
                                    _a.label = 8;
                                case 8: return [2 /*return*/, __assign(__assign({}, memo), hook)];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); }, isPromiseLike(initialValue)
                        ? initialValue
                        : Promise.resolve(initialValue));
                }
                else {
                    return hooks.reduce(function (memo, hook) {
                        assert(typeof hook === 'function' || typeof hook === 'object', "applyPlugins failed, all hooks for key ".concat(key, " must be function or plain object."));
                        if (typeof hook === 'function') {
                            return hook(memo, args);
                        }
                        else {
                            // TODO: deepmerge?
                            return __assign(__assign({}, memo), hook);
                        }
                    }, initialValue);
                }
            case ApplyPluginsType.event:
                return (function () { return __awaiter(_this, void 0, void 0, function () {
                    var _i, hooks_1, hook, ret;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _i = 0, hooks_1 = hooks;
                                _a.label = 1;
                            case 1:
                                if (!(_i < hooks_1.length)) return [3 /*break*/, 4];
                                hook = hooks_1[_i];
                                assert(typeof hook === 'function', "applyPlugins failed, all hooks for key ".concat(key, " must be function."));
                                ret = hook(args);
                                if (!(async && isPromiseLike(ret))) return [3 /*break*/, 3];
                                return [4 /*yield*/, ret];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })();
            case ApplyPluginsType.compose:
                return function () {
                    return compose({
                        fns: hooks.concat(initialValue),
                        args: args,
                    })();
                };
        }
    };
    PluginManager.create = function (opts) {
        var pluginManager = new PluginManager({
            validKeys: opts.validKeys,
        });
        opts.plugins.forEach(function (plugin) {
            pluginManager.register(plugin);
        });
        return pluginManager;
    };
    return PluginManager;
}());
export { PluginManager };
// plugins meta info (in tmp file)
// hooks api: usePlugin
