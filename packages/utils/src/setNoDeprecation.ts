export function setNoDeprecation() {
  // Use magic to suppress node deprecation warnings
  // See: https://github.com/nodejs/node/blob/master/lib/internal/process/warning.js#L95
  // @ts-ignore
  process.noDeprecation = '1';
}
