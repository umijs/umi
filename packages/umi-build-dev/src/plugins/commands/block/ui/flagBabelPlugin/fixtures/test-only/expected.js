"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _antd = require("antd");

var _proLayout = require("@ant-design/pro-layout");

var _locale = require("umi-plugin-react/locale");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CodePreview = function CodePreview(_ref) {
  var children = _ref.children;
  return _react.default.createElement("pre", {
    style: {
      background: '#f2f4f5',
      padding: '12px 20px',
      margin: '12px 0'
    }
  }, _react.default.createElement("code", null, _react.default.createElement(_antd.Typography.Text, {
    copyable: true
  }, children)));
};

var _default = function _default() {
  return _react.default.createElement(_proLayout.PageHeaderWrapper, null, _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.tsx",
    index: "0"
  }), _react.default.createElement(_antd.Card, null, _react.default.createElement(_antd.Alert, {
    message: "umi ui \u73B0\u5DF2\u53D1\u5E03\uFF0C\u6B22\u8FCE\u4F7F\u7528 npm run ui \u542F\u52A8\u4F53\u9A8C\u3002",
    type: "success",
    showIcon: true,
    banner: true,
    style: {
      margin: -12,
      marginBottom: 24
    }
  }), _react.default.createElement(_antd.Typography.Text, {
    strong: true
  }, _react.default.createElement("a", {
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://pro.ant.design/docs/block"
  }, _react.default.createElement(_locale.FormattedMessage, {
    id: "app.welcome.link.block-list",
    defaultMessage: "\u57FA\u4E8E block \u5F00\u53D1\uFF0C\u5FEB\u901F\u6784\u5EFA\u6807\u51C6\u9875\u9762"
  }))), _react.default.createElement(CodePreview, null, "npx umi block list"), _react.default.createElement(_antd.Typography.Text, {
    strong: true,
    style: {
      marginBottom: 12
    }
  }, _react.default.createElement("a", {
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://pro.ant.design/docs/available-script#npm-run-fetchblocks"
  }, _react.default.createElement(_locale.FormattedMessage, {
    id: "app.welcome.link.fetch-blocks",
    defaultMessage: "\u83B7\u53D6\u5168\u90E8\u533A\u5757"
  }))), _react.default.createElement(CodePreview, null, " npm run fetch:blocks")), _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.tsx",
    index: "1"
  }), _react.default.createElement("p", {
    style: {
      textAlign: 'center',
      marginTop: 24
    }
  }, "Want to add more pages? Please refer to", ' ', _react.default.createElement("a", {
    href: "https://pro.ant.design/docs/block-cn",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "use block"), "\u3002"), _react.default.createElement(GUmiUIFlag, {
    filename: "/tmp/origin.tsx",
    index: "2"
  }));
};

exports.default = _default;