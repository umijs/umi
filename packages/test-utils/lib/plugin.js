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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api) {
  api.describe({
    key: 'testUtils'
  });
  api.modifyConfig(memo => {
    memo.history = {
      type: 'memory',
      options: {
        initialEntries: ['/']
      }
    };
    memo.mountElementId = '';
    return memo;
  });
}