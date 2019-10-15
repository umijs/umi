"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var App = Form.create()(function () {
  return _react.default.createElement("div", null, _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.tsx",
    index: "0"
  }), _react.default.createElement("h1", null, "foo"), _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.tsx",
    index: "1"
  }));
});

var _default = connect()(App);

exports.default = _default;