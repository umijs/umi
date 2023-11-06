import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _typeof from "@babel/runtime/helpers/esm/typeof";
import _createForOfIteratorHelper from "@babel/runtime/helpers/esm/createForOfIteratorHelper";
import _toArray from "@babel/runtime/helpers/esm/toArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { assert, compose, isPromiseLike } from "./utils";
export var ApplyPluginsType = /*#__PURE__*/function (ApplyPluginsType) {
  ApplyPluginsType["compose"] = "compose";
  ApplyPluginsType["modify"] = "modify";
  ApplyPluginsType["event"] = "event";
  return ApplyPluginsType;
}({});
export var PluginManager = /*#__PURE__*/function () {
  function PluginManager(opts) {
    _classCallCheck(this, PluginManager);
    _defineProperty(this, "opts", void 0);
    _defineProperty(this, "hooks", {});
    this.opts = opts;
  }
  _createClass(PluginManager, [{
    key: "register",
    value: function register(plugin) {
      var _this = this;
      assert(plugin.apply, "plugin register failed, apply must supplied");
      Object.keys(plugin.apply).forEach(function (key) {
        assert(_this.opts.validKeys.indexOf(key) > -1, "register failed, invalid key ".concat(key, " ").concat(plugin.path ? "from plugin ".concat(plugin.path) : '', "."));
        _this.hooks[key] = (_this.hooks[key] || []).concat(plugin.apply[key]);
      });
    }
  }, {
    key: "getHooks",
    value: function getHooks(keyWithDot) {
      var _keyWithDot$split = keyWithDot.split('.'),
        _keyWithDot$split2 = _toArray(_keyWithDot$split),
        key = _keyWithDot$split2[0],
        memberKeys = _keyWithDot$split2.slice(1);
      var hooks = this.hooks[key] || [];
      if (memberKeys.length) {
        hooks = hooks.map(function (hook) {
          try {
            var ret = hook;
            var _iterator = _createForOfIteratorHelper(memberKeys),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var memberKey = _step.value;
                ret = ret[memberKey];
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            return ret;
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      }
      return hooks;
    }
  }, {
    key: "applyPlugins",
    value: function applyPlugins(_ref) {
      var key = _ref.key,
        type = _ref.type,
        initialValue = _ref.initialValue,
        args = _ref.args,
        async = _ref.async;
      var hooks = this.getHooks(key) || [];
      if (args) {
        assert(_typeof(args) === 'object', "applyPlugins failed, args must be plain object.");
      }
      if (async) {
        assert(type === ApplyPluginsType.modify || type === ApplyPluginsType.event, "async only works with modify and event type.");
      }
      switch (type) {
        case ApplyPluginsType.modify:
          if (async) {
            return hooks.reduce( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(memo, hook) {
                var ret;
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      assert(typeof hook === 'function' || _typeof(hook) === 'object' || isPromiseLike(hook), "applyPlugins failed, all hooks for key ".concat(key, " must be function, plain object or Promise."));
                      if (!isPromiseLike(memo)) {
                        _context.next = 5;
                        break;
                      }
                      _context.next = 4;
                      return memo;
                    case 4:
                      memo = _context.sent;
                    case 5:
                      if (!(typeof hook === 'function')) {
                        _context.next = 16;
                        break;
                      }
                      ret = hook(memo, args);
                      if (!isPromiseLike(ret)) {
                        _context.next = 13;
                        break;
                      }
                      _context.next = 10;
                      return ret;
                    case 10:
                      return _context.abrupt("return", _context.sent);
                    case 13:
                      return _context.abrupt("return", ret);
                    case 14:
                      _context.next = 21;
                      break;
                    case 16:
                      if (!isPromiseLike(hook)) {
                        _context.next = 20;
                        break;
                      }
                      _context.next = 19;
                      return hook;
                    case 19:
                      hook = _context.sent;
                    case 20:
                      return _context.abrupt("return", _objectSpread(_objectSpread({}, memo), hook));
                    case 21:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function (_x, _x2) {
                return _ref2.apply(this, arguments);
              };
            }(), isPromiseLike(initialValue) ? initialValue : Promise.resolve(initialValue));
          } else {
            return hooks.reduce(function (memo, hook) {
              assert(typeof hook === 'function' || _typeof(hook) === 'object', "applyPlugins failed, all hooks for key ".concat(key, " must be function or plain object."));
              if (typeof hook === 'function') {
                return hook(memo, args);
              } else {
                // TODO: deepmerge?
                return _objectSpread(_objectSpread({}, memo), hook);
              }
            }, initialValue);
          }
        case ApplyPluginsType.event:
          return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var _iterator2, _step2, hook, ret;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _iterator2 = _createForOfIteratorHelper(hooks);
                  _context2.prev = 1;
                  _iterator2.s();
                case 3:
                  if ((_step2 = _iterator2.n()).done) {
                    _context2.next = 12;
                    break;
                  }
                  hook = _step2.value;
                  assert(typeof hook === 'function', "applyPlugins failed, all hooks for key ".concat(key, " must be function."));
                  ret = hook(args);
                  if (!(async && isPromiseLike(ret))) {
                    _context2.next = 10;
                    break;
                  }
                  _context2.next = 10;
                  return ret;
                case 10:
                  _context2.next = 3;
                  break;
                case 12:
                  _context2.next = 17;
                  break;
                case 14:
                  _context2.prev = 14;
                  _context2.t0 = _context2["catch"](1);
                  _iterator2.e(_context2.t0);
                case 17:
                  _context2.prev = 17;
                  _iterator2.f();
                  return _context2.finish(17);
                case 20:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, null, [[1, 14, 17, 20]]);
          }))();
        case ApplyPluginsType.compose:
          return function () {
            return compose({
              fns: hooks.concat(initialValue),
              args: args
            })();
          };
      }
    }
  }], [{
    key: "create",
    value: function create(opts) {
      var pluginManager = new PluginManager({
        validKeys: opts.validKeys
      });
      opts.plugins.forEach(function (plugin) {
        pluginManager.register(plugin);
      });
      return pluginManager;
    }
  }]);
  return PluginManager;
}();

// plugins meta info (in tmp file)
// hooks api: usePlugin