import isEqual from 'lodash.isequal';
import isPlainObject from 'is-plain-object';

function funcToStr(obj) {
  if (typeof obj === 'function') return obj.toString();
  if (isPlainObject(obj)) {
    return Object.keys(obj).reduce((memo, key) => {
      memo[key] = funcToStr(obj[key]);
      return memo;
    }, {});
  } else {
    return obj;
  }
}

export default function(a, b) {
  return isEqual(funcToStr(a), funcToStr(b));
}
