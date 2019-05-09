"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = foo;

function foo(opts) {
  return opts.foo ? 'foo' : 'bar';
}