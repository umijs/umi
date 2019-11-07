"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DocumentTitle = _react.default.createElement("div", null);

var _default = function _default() {
  return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.js",
    index: "0"
  }), _react.default.createElement(DocumentTitle, null), _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.js",
    index: "1"
  }));
};

exports.default = _default;