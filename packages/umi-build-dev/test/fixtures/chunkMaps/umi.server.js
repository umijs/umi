
serverRender = async ctx => {
  const htmlTemplateMap = {
    '/': _react.default.createElement("html", null, _react.default.createElement("head", null, _react.default.createElement("link", {
      rel: "stylesheet",
      href: "/umiPublic/__UMI_SERVER__.css"
    }), _react.default.createElement("script", {
      src: "/umiPublic/__UMI_SERVER__.js"
    }))),
  };
  return {
    htmlElement: htmlTemplateMap[pathname],
    rootContainer
  };
}; // using project react-dom version
// https://github.com/facebook/react/issues/13991


exports.ReactDOMServer = ReactDOMServer = __webpack_require__(/*! react-dom/server */ "react-dom/server");
