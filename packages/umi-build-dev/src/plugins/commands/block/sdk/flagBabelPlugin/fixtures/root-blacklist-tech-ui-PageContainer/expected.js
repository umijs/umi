"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _techUi = require("@alipay/tech-ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default() {
  return _react.default.createElement(_techUi.PageContainer, null, _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.js",
    index: "0"
  }), "hi");
};

exports.default = _default;