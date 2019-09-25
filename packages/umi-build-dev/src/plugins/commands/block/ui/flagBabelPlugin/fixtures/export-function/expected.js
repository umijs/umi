"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return _react.default.createElement("div", null, _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.js",
    index: "0"
  }), _react.default.createElement("h1", null, "foo"), _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.js",
    index: "1"
  }));
}
