"use strict";

require("bar");

var _foo = _interopRequireDefault(require("./foo"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log((0, _foo.default)());