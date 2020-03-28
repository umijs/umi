import { lodash } from '@umijs/utils';

function funcToStr(obj: Function | object) {
  if (typeof obj === 'function') return obj.toString();
  if (lodash.isPlainObject(obj)) {
    return Object.keys(obj).reduce((memo, key) => {
      memo[key] = funcToStr(obj[key]);
      return memo;
    }, {});
  } else {
    return obj;
  }
}

export default function (a: any, b: any) {
  return lodash.isEqual(funcToStr(a), funcToStr(b));
}
