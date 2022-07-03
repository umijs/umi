"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {};
exports.default = _default;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("@umijs/utils");

  _utils = function _utils() {
    return data;
  };

  return data;
}

function _assert() {
  const data = _interopRequireDefault(require("assert"));

  _assert = function _assert() {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _jest() {
  const data = require("jest");

  _jest = function _jest() {
    return data;
  };

  return data;
}

function _args() {
  const data = require("jest-cli/build/cli/args");

  _args = function _args() {
    return data;
  };

  return data;
}

function _path() {
  const data = require("path");

  _path = function _path() {
    return data;
  };

  return data;
}

var _createDefaultConfig = _interopRequireDefault(require("./createDefaultConfig/createDefaultConfig"));

var _utils2 = require("./utils");

Object.keys(_utils2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _utils2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _utils2[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const debug = (0, _utils().createDebug)('umi:test');

function _default(_x) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = _asyncToGenerator(function* (args) {
    process.env.NODE_ENV = 'test';

    if (args.debug) {
      _utils().createDebug.enable('umi:test');
    }

    debug(`args: ${JSON.stringify(args)}`); // Print related versions

    if (args.version) {
      console.log(`umi-test@${require('../package.json').version}`);
      console.log(`jest@${require('jest/package.json').version}`);
      return;
    }

    const cwd = args.cwd || process.cwd(); // Read config from cwd/jest.config.js

    const userJestConfigFile = (0, _path().join)(cwd, 'jest.config.js');

    const userJestConfig = (0, _fs().existsSync)(userJestConfigFile) && require(userJestConfigFile);

    debug(`config from jest.config.js: ${JSON.stringify(userJestConfig)}`); // Read jest config from package.json

    const packageJSONPath = (0, _path().join)(cwd, 'package.json');

    const packageJestConfig = (0, _fs().existsSync)(packageJSONPath) && require(packageJSONPath).jest;

    debug(`jest config from package.json: ${JSON.stringify(packageJestConfig)}`); // Merge configs
    // user config and args config could have value function for modification

    const config = (0, _utils().mergeConfig)((0, _createDefaultConfig.default)(cwd, args), packageJestConfig, userJestConfig);
    debug(`final config: ${JSON.stringify(config)}`); // Generate jest options

    const argsConfig = Object.keys(_args().options).reduce((prev, name) => {
      if (args[name]) prev[name] = args[name]; // Convert alias args into real one

      const alias = _args().options[name].alias;

      if (alias && args[alias]) prev[name] = args[alias];
      return prev;
    }, {});
    debug(`config from args: ${JSON.stringify(argsConfig)}`); // Run jest

    const result = yield (0, _jest().runCLI)(_objectSpread({
      // @ts-ignore
      _: args._ || [],
      // @ts-ignore
      $0: args.$0 || '',
      // 必须是单独的 config 配置，值为 string，否则不生效
      // @ts-ignore
      config: JSON.stringify(config)
    }, argsConfig), [cwd]);
    debug(result); // Throw error when run failed

    (0, _assert().default)(result.results.success, `Test with jest failed`);
  });
  return _ref.apply(this, arguments);
}