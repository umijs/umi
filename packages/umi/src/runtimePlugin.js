import assert from 'assert';
import isPlainObject from 'lodash/isPlainObject';
import { isPromiseLike } from './utils';

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
    assert(validKeys.concat('default').indexOf(key) > -1, `Invalid key ${key} from plugin`);
  });
  plugins.push(plugin);
}

export function getItem(key) {
  assert(validKeys.indexOf(key) > -1, `Invalid key ${key}`);
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

export async function mergeConfigAsync(item) {
  if (typeof item === 'string') item = getItem(item);
  assert(Array.isArray(item), `item must be Array`);

  let mergedConfig = {};
  for (let config of item) {
    if (isPromiseLike(config)) {
      // eslint-disable-next-line no-await-in-loop
      config = await config;
    }
    assert(isPlainObject(config), `Config is not plain object`);
    mergedConfig = { ...mergedConfig, ...config };
  }

  return mergedConfig;
}
