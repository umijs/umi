export function objToStringified(obj: object) {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = JSON.stringify(obj[key]);
    return memo;
  }, {});
}
