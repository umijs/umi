// UMI depends on promise
import 'core-js/es6/promise';

// React depends on set/map/requestAnimationFrame
// https://reactjs.org/docs/javascript-environment-requirements.html
import 'core-js/es6/set';
import 'core-js/es6/map';
import 'core-js/es6/object';
import 'core-js/es6/number';
import 'core-js/es6/array';

import 'url-polyfill';

// https://github.com/umijs/umi/issues/413
Object.setPrototypeOf = require('setprototypeof');
