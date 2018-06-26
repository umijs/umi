/**
 * 此polyfill仅支持IE9+，因为umi部分底层库版本如react、prop-types版本已经不支持IE8。
 */

// UMI depends on promise
import "core-js/es6/promise";
// React depends on set/map/requestAnimationFrame
// https://reactjs.org/docs/javascript-environment-requirements.html
import "core-js/es6/set";
import "core-js/es6/map";
import "raf/polyfill";

// import 'web-animations-js';  // Run `npm install --save web-animations-js`.
// import 'classlist.js';  // Run `npm install --save classlist.js`.

//https://github.com/umijs/umi/issues/413
Object.setPrototypeOf = require('setprototypeof');

//https://github.com/ant-design/ant-design/issues/9876
if (window.NodeList && !NodeList.prototype.forEach) {
  // forEach IE9 已经支持，无须加polyfill
  NodeList.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
