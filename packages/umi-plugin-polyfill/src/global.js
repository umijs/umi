// UMI depends on promise
import 'core-js/es6/promise';

// React depends on set/map/requestAnimationFrame
// https://reactjs.org/docs/javascript-environment-requirements.html
import 'core-js/es6/set';
import 'core-js/es6/map';
import 'raf/polyfill';

// https://github.com/umijs/umi/issues/413
Object.setPrototypeOf = require('setprototypeof');

// import 'web-animations-js';  // Run `npm install --save web-animations-js`.
// import 'classlist.js';  // Run `npm install --save classlist.js`.
