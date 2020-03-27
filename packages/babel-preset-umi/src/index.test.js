import { transform } from '@babel/core';

test('object spread', () => {
  const { code } = transform(`const a = { ...b };`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const a = _objectSpread({}, b);
  `.trim(),
  );
});

// ref: https://github.com/babel/babel/issues/7215
test('transform destructuring', () => {
  const { code } = transform(`const [{ ...rest }] = [{}];`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const rest = _extends({}, {});
  `.trim(),
  );
});

test('require react automatically', () => {
  const { code } = transform(`function Foo() { return <div />; }`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Foo() {
  return /*#__PURE__*/_react.default.createElement("div", null);
}
  `.trim(),
  );
});

test('dynamic import', () => {
  const { code } = transform(`import('./a');`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

import('./a');
  `.trim(),
  );
});

test('optional catch binding', () => {
  const { code } = transform(`try { throw e } catch {}`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

try {
  throw e;
} catch (_unused) {}
  `.trim(),
  );
});

test('async generator function', () => {
  const { code } = transform(`async function* agf() { await 1; yield 2; }`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen.return !== "function") { this.return = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

function agf() {
  return _agf.apply(this, arguments);
}

function _agf() {
  _agf = _wrapAsyncGenerator(function* () {
    yield _awaitAsyncGenerator(1);
    yield 2;
  });
  return _agf.apply(this, arguments);
}
  `.trim(),
  );
});

test('decorators', () => {
  const { code } = transform(`@foo class Foo {}`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

var _class;

let Foo = foo(_class = class Foo {}) || _class;
  `.trim(),
  );
});

test('class properties', () => {
  const { code } = transform(`class Foo { a = 'b'; foo = () => this.a; static c = 'd';}`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

class Foo {
  constructor() {
    this.a = 'b';

    this.foo = () => this.a;
  }

}

Foo.c = 'd';
  `.trim(),
  );
});

xtest('export namespace from', () => {
  const { code } = transform(`export * as ns from 'mod';`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ns = void 0;

var _ns = _interopRequireWildcard(require("mod"));

exports.ns = _ns;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }
  `.trim(),
  );
});

test('export default from', () => {
  const { code } = transform(`export v from 'mod';`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "v", {
  enumerable: true,
  get: function () {
    return _mod.default;
  }
});

var _mod = _interopRequireDefault(require("mod"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  `.trim(),
  );
});

test('nullish coalescing operator', () => {
  const { code } = transform(`const a = foo.bar ?? 'hoo';`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

var _foo$bar;

const a = (_foo$bar = foo.bar) !== null && _foo$bar !== void 0 ? _foo$bar : 'hoo';
  `.trim(),
  );
});

test('optional chaining', () => {
  const { code } = transform(`const a = b?.c?.d;`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

var _b, _b$c;

const a = (_b = b) === null || _b === void 0 ? void 0 : (_b$c = _b.c) === null || _b$c === void 0 ? void 0 : _b$c.d;
  `.trim(),
  );
});

test('pipeline operator', () => {
  const { code } = transform(`const a = b |> c |> d;`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

var _ref, _b;

const a = (_ref = (_b = b, c(_b)), d(_ref));
  `.trim(),
  );
});

test('do expression', () => {
  const { code } = transform(`const a = do { if (foo) 'foo'; else 'bar'; }`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

const a = foo ? 'foo' : 'bar';
  `.trim(),
  );
});

test('function bind', () => {
  const { code } = transform(`a::b; ::a.b; a::b(c); ::a.b(c);`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toEqual(
    `
"use strict";

var _context;

(_context = a, b).bind(_context);

(_context = a).b.bind(_context);

(_context = a, b).call(_context, c);

(_context = a).b.call(_context, c);
  `.trim(),
  );
});
