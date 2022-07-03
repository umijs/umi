"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTmp = generateTmp;
exports.generateHTML = generateHTML;
exports.render = render;
exports.getHTML = getHTML;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _react2() {
  const data = require("@testing-library/react");

  _react2 = function _react2() {
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

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function generateTmp(_x) {
  return _generateTmp.apply(this, arguments);
}

function _generateTmp() {
  _generateTmp = _asyncToGenerator(function* (opts) {
    const Service = opts.Service || _umi().Service;

    const service = new Service({
      cwd: opts.cwd,
      plugins: [require.resolve('./plugin')]
    });
    yield service.run({
      name: 'g',
      args: {
        _: ['g', 'tmp']
      }
    });
  });
  return _generateTmp.apply(this, arguments);
}

function generateHTML(_x2) {
  return _generateHTML.apply(this, arguments);
}

function _generateHTML() {
  _generateHTML = _asyncToGenerator(function* (opts) {
    const Service = opts.Service || _umi().Service;

    const service = new Service({
      cwd: opts.cwd,
      plugins: [require.resolve('./plugin')]
    });
    yield service.run({
      name: 'g',
      args: {
        _: ['g', 'html']
      }
    });
  });
  return _generateHTML.apply(this, arguments);
}

function render(opts) {
  return (0, _react2().render)(require((0, _path().join)(opts.cwd, '.umi-test', 'umi.ts')).default);
}

function getHTML(opts) {
  return (0, _fs().readFileSync)((0, _path().join)(opts.cwd, 'dist', 'index.html'), 'utf-8');
}