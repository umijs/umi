import assert from 'assert';

let plugins = null;
let validKeys = [];

export function init(opts = {}) {
  plugins = [];
  validKeys = opts.validKeys;
}

export function use(plugin) {
  Object.keys(plugin).forEach(key => {
    assert(validKeys.includes(key), `Invalid key ${key} from plugin`);
  });
  plugins.push(plugin);
}

export function getItem(key) {
  return plugins.filter(plugin => key in plugin).map(plugin => plugin[key]);
}

function _compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

export function compose(item, { initialValue }) {
  if (typeof item === 'string') item = getItem(item);
  return () => {
    _compose(...item)(initialValue);
  };
}

export function apply(item, { initialValue }) {
  if (typeof item === 'string') item = getItem(item);
  assert(Array.isArray(item), `item must be Array`);
  return item.reduce((memo, fn) => {
    assert(typeof fn === 'function', `applied item must be function`);
    return fn(memo);
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
  return item.reduce(
    item,
    (memo, config) => {
      return { ...memo, ...config };
    },
    {},
  );
}
