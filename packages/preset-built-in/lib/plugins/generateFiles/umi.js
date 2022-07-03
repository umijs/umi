"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importsToStr = importsToStr;
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

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function importsToStr(imports) {
  return imports.map(imp => {
    const source = imp.source,
          specifier = imp.specifier;

    if (specifier) {
      return `import ${specifier} from '${(0, _utils().winPath)(source)}';`;
    } else {
      return `import '${(0, _utils().winPath)(source)}';`;
    }
  });
}

function _default(api) {
  const Mustache = api.utils.Mustache;
  api.onGenerateFiles( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (args) {
      const umiTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'umi.tpl'), 'utf-8');
      const rendererPath = yield api.applyPlugins({
        key: 'modifyRendererPath',
        type: api.ApplyPluginsType.modify,
        initialValue: _constants.renderReactPath
      });
      api.writeTmpFile({
        path: 'umi.ts',
        content: Mustache.render(umiTpl, {
          // @ts-ignore
          enableTitle: api.config.title !== false,
          defaultTitle: api.config.title || '',
          rendererPath: (0, _utils().winPath)(rendererPath),
          runtimePath: _constants.runtimePath,
          rootElement: api.config.mountElementId,
          enableSSR: !!api.config.ssr,
          enableHistory: !!api.config.history,
          dynamicImport: !!api.config.dynamicImport,
          entryCode: (yield api.applyPlugins({
            key: 'addEntryCode',
            type: api.ApplyPluginsType.add,
            initialValue: []
          })).join('\r\n'),
          entryCodeAhead: (yield api.applyPlugins({
            key: 'addEntryCodeAhead',
            type: api.ApplyPluginsType.add,
            initialValue: []
          })).join('\r\n'),
          polyfillImports: importsToStr(yield api.applyPlugins({
            key: 'addPolyfillImports',
            type: api.ApplyPluginsType.add,
            initialValue: []
          })).join('\r\n'),
          importsAhead: importsToStr(yield api.applyPlugins({
            key: 'addEntryImportsAhead',
            type: api.ApplyPluginsType.add,
            initialValue: []
          })).join('\r\n'),
          imports: importsToStr(yield api.applyPlugins({
            key: 'addEntryImports',
            type: api.ApplyPluginsType.add,
            initialValue: []
          })).join('\r\n')
        })
      });
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}