export function setNoDeprecation() {
  // Use magic to suppress node deprecation warnings
  // See: https://github.com/nodejs/node/blob/6311de332223e855e7f1ce03b7c920f51f308e95/lib/internal/process/warning.js#L95
  // @ts-ignore
  process.noDeprecation = '1';
}
