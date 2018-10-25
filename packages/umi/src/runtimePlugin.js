import assert from 'assert';
import isPlainObject from 'is-plain-object';

let plugins = null;
let validKeys = [];

export function init(opts = {}) {
  plugins = [];
  validKeys = opts.validKeys || [];
}

export function use(plugin) {
  Object.keys(plugin).forEach(key => {
    // TODO: remove default
    // default 是为了兼容内部框架内置的一个 babel 插件问题
    assert(
      validKeys.concat('default').includes(key),
      `Invalid key ${key} from plugin`,
    );
  });
  plugins.push(plugin);
}

export function getItem(key) {
  assert(validKeys.includes(key), `Invalid key ${key}`);
  return plugins.filter(plugin => key in plugin).map(plugin => plugin[key]);
}

function _compose(...funcs) {
  if (funcs.length === 1) {
    return funcs[0];
  }
  const last = funcs.pop();
  return funcs.reduce((a, b) => () => b(a), last);
}

export function compose(item, { initialValue }) {
  if (typeof item === 'string') item = getItem(item);
  return () => {
    return _compose(...item, initialValue)();
  };
}

export function apply(item, { initialValue, args }) {
  if (typeof item === 'string') item = getItem(item);
  assert(Array.isArray(item), `item must be Array`);
  return item.reduce((memo, fn) => {
    assert(typeof fn === 'function', `applied item must be function`);
    return fn(memo, args);
  }, initialValue);
}

export function applyForEach(item, { initialValue }) {
  if (typeof item === 'string') item = getItem(item);
  assert(Array.isArray(item), `item must be Array`);
  item.forEach(fn => {
    assert(typeof fn === 'function', `applied item must be function`);
    fn(initialValue);
  });
}

// shadow merge
export function mergeConfig(item) {
  if (typeof item === 'string') item = getItem(item);
  assert(Array.isArray(item), `item must be Array`);
  return item.reduce((memo, config) => {
    assert(isPlainObject(config), `Config is not plain object`);
    return { ...memo, ...config };
  }, {});
}
