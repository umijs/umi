"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const consoleFunctionName = Object.keys(console).filter(key => typeof console[key] === 'function');
/**
 * @example
 * function sample() {
 *   console.log('a');
 *   console.warn('b');
 *   return 0;
 * }
 *
 * test('test sample', () => {
 *   const reset = mockConsole();
 *   expect(sample()).toBe(0);
 *   reset();
 *   expect(reset.messages).toEqual([
 *     ['log', 'a'],
 *     ['warn', 'b'],
 *   ]);
 * });
 *
 * test('test sample', () => {
 *   const reset = mockConsole.log();
 *   expect(sample()).toBe(0);
 *   reset();
 *   expect(reset.messages).toEqual([['a']]);
 * });
 */

function mockConsole(messageStore = []) {
  const self = mockConsole;
  const messages = Array.isArray(messageStore) ? messageStore : [];
  const callback = Array.isArray(messageStore) ? null : messageStore;
  const resets = consoleFunctionName.map(name => {
    return self[name]((...args) => {
      messages.push([name, ...args]);
      if (callback) callback(name, ...args);
    });
  });

  const reset = () => resets.forEach(fn => fn());

  reset.messages = messages;
  return reset;
}

var _iterator = _createForOfIteratorHelper(consoleFunctionName),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    const name = _step.value;
    mockConsole[name] = getMockConsoleFunction(name);
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

var _default = mockConsole;
exports.default = _default;

function getMockConsoleFunction(name) {
  return function mockConsoleFunction(messageStore = []) {
    const messages = Array.isArray(messageStore) ? messageStore : [];
    const callback = Array.isArray(messageStore) ? null : messageStore;
    const consoleSpy = jest.spyOn(console, name).mockImplementation((...args) => {
      messages.push(args);
      if (callback) callback(...args);
    });

    const reset = () => consoleSpy.mockRestore();

    reset.messages = messages;
    return reset;
  };
}