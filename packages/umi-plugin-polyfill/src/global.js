import '@babel/polyfill';
import 'core-js/fn/array/for-each';
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.
// import 'classlist.js';  // Run `npm install --save classlist.js`.

//https://github.com/umijs/umi/issues/413
Object.setPrototypeOf = require('setprototypeof');

//https://github.com/ant-design/ant-design/issues/9876
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
