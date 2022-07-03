"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

function _path() {
  const data = require("path");

  _path = function _path() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(cwd, args) {
  const testMatchTypes = ['spec', 'test'];

  if (args.e2e) {
    testMatchTypes.push('e2e');
  }

  const isLerna = (0, _utils().isLernaPackage)(cwd);
  const hasPackage = isLerna && args.package;
  const testMatchPrefix = hasPackage ? `**/packages/${args.package}/` : '';
  const hasSrc = (0, _fs().existsSync)((0, _path().join)(cwd, 'src'));

  if (hasPackage) {
    (0, _assert().default)((0, _fs().existsSync)((0, _path().join)(cwd, 'packages', args.package)), `You specified --package, but packages/${args.package} does not exists.`);
  }

  return _objectSpread({
    collectCoverageFrom: ['index.{js,jsx,ts,tsx}', hasSrc && 'src/**/*.{js,jsx,ts,tsx}', isLerna && !args.package && 'packages/*/src/**/*.{js,jsx,ts,tsx}', isLerna && args.package && `packages/${args.package}/src/**/*.{js,jsx,ts,tsx}`, '!**/typings/**', '!**/types/**', '!**/fixtures/**', '!**/examples/**', '!**/*.d.ts'].filter(Boolean),
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss|stylus)$': require.resolve('identity-obj-proxy')
    },
    setupFiles: [require.resolve('../../helpers/setupFiles/shim')],
    setupFilesAfterEnv: [require.resolve('../../helpers/setupFiles/jasmine')],
    testEnvironment: require.resolve('jest-environment-jsdom-fourteen'),
    testMatch: [`${testMatchPrefix}**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': require.resolve('../../helpers/transformers/javascript'),
      '^.+\\.(css|less|sass|scss|stylus)$': require.resolve('../../helpers/transformers/css'),
      '^(?!.*\\.(js|jsx|ts|tsx|css|less|sass|scss|stylus|json)$)': require.resolve('../../helpers/transformers/file')
    },
    verbose: true,
    transformIgnorePatterns: [// 加 [^/]*? 是为了兼容 tnpm 的目录结构
      // 比如：_umi-test@1.5.5@umi-test
      // `node_modules/(?!([^/]*?umi|[^/]*?umi-test)/)`,
    ]
  }, process.env.MAX_WORKERS ? {
    maxWorkers: Number(process.env.MAX_WORKERS)
  } : {});
}