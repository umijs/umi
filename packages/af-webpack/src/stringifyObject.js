export default function(obj) {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = JSON.stringify(obj[key]);
    return memo;
  }, {});
}
