import React from 'react';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = "\n.g {\n  font-weight: bold;\n}\n";
styleInject(css);

var css$1 = ".b {\n  border: 2px solid #ccc;\n}\n";
styleInject(css$1);

function index (props) {
  return React.createElement("button", {
    className: "g b",
    style: {
      fontSize: props.size === 'large' ? 40 : 20
    }
  }, props.children);
}

export { index as button };
