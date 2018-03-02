import assert from 'assert';

const debug = require('debug')('umi-build-dev:requestCache');

// Urls user requested
const requested = {};

export function setRequest(url, opts = {}) {
  assert(typeof url === 'string', `request url must be string, but got ${url}`);
  debug(`request: ${url}`);
  const { onChange } = opts;
  if (!requested[url]) {
    requested[url] = 1;
    if (url === '/index.html') requested['/'] = 1;
    if (onChange) {
      onChange();
    }
  }
}

export function getRequest() {
  return requested;
}
