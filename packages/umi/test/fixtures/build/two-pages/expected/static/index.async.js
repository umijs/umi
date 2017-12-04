webpackJsonp([1],{

/***/ 173:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/umi-build-dev/node_modules/_antd-mobile@2.1.0@antd-mobile/es/button/style/index.js + 2 modules
var style = __webpack_require__(138);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/umi-build-dev/node_modules/_antd-mobile@2.1.0@antd-mobile/es/button/index.js + 4 modules
var es_button = __webpack_require__(139);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/umi-build-dev/node_modules/_preact-compat@3.17.0@preact-compat/dist/preact-compat.js
var preact_compat = __webpack_require__(3);
var preact_compat_default = /*#__PURE__*/__webpack_require__.n(preact_compat);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/af-webpack/node_modules/_@babel_runtime@7.0.0-beta.31@@babel/runtime/core-js/object/get-prototype-of.js
var get_prototype_of = __webpack_require__(15);
var get_prototype_of_default = /*#__PURE__*/__webpack_require__.n(get_prototype_of);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/af-webpack/node_modules/_@babel_runtime@7.0.0-beta.31@@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(16);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/af-webpack/node_modules/_@babel_runtime@7.0.0-beta.31@@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(17);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/af-webpack/node_modules/_@babel_runtime@7.0.0-beta.31@@babel/runtime/helpers/possibleConstructorReturn.js
var possibleConstructorReturn = __webpack_require__(18);
var possibleConstructorReturn_default = /*#__PURE__*/__webpack_require__.n(possibleConstructorReturn);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/af-webpack/node_modules/_@babel_runtime@7.0.0-beta.31@@babel/runtime/helpers/inherits.js
var inherits = __webpack_require__(19);
var inherits_default = /*#__PURE__*/__webpack_require__.n(inherits);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/umi/src/router.js
var router = __webpack_require__(142);

// EXTERNAL MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/umi/src/utils.js
var utils = __webpack_require__(143);

// CONCATENATED MODULE: /Users/chencheng/Documents/Work/Misc/umi/packages/umi/src/link.js









var link_Link =
/*#__PURE__*/
function (_Component) {
  inherits_default()(Link, _Component);

  function Link() {
    var _ref;

    var _temp, _this;

    classCallCheck_default()(this, Link);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return possibleConstructorReturn_default()(_this, (_temp = _this = possibleConstructorReturn_default()(this, (_ref = Link.__proto__ || get_prototype_of_default()(Link)).call.apply(_ref, [this].concat(args))), _this.linkClicked = function (e) {
      if (e.currentTarget.nodeName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.nativeEvent && e.nativeEvent.which === 2)) {
        return;
      }

      var to = _this.props.to;
      var path = Object(utils["c" /* normalizePath */])(to);

      if (!Object(utils["b" /* isLocal */])(path)) {
        return;
      }

      e.preventDefault();
      var replace = _this.props.replace;
      var changeMethod = replace ? 'replace' : 'push';
      router["a" /* default */][changeMethod](to);
    }, _temp));
  }

  createClass_default()(Link, [{
    key: "render",
    value: function render() {
      var children = this.props.children;

      if (typeof children === 'string') {
        children = preact_compat_default.a.createElement("a", null, children);
      }

      var child = preact_compat["Children"].only(children);
      var props = {
        onClick: this.linkClicked
      };
      return preact_compat_default.a.cloneElement(child, props);
    }
  }]);

  return Link;
}(preact_compat["Component"]);

/* harmony default export */ var src_link = (link_Link);
// CONCATENATED MODULE: ./pages/index.js





var pages__ref = preact_compat_default.a.createElement("div", null, preact_compat_default.a.createElement("h1", null, "Index Page"), preact_compat_default.a.createElement(src_link, {
  to: "/list"
}, preact_compat_default.a.createElement(es_button["a" /* default */], {
  type: "primary"
}, "\u8DF3\u8F6C\u5230\u5217\u8868\u9875")));

/* harmony default export */ var pages = __webpack_exports__["default"] = (function () {
  return pages__ref;
});

/***/ })

});