export function stripLastSlash(str) {
  return str.slice(-1) === '/' ? str.slice(0, -1) : str;
}
