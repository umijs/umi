const debug = require('debug')('koi-buildAndDev:send');

export const PAGE_LIST = 'PAGE_LIST';
export const BUILD_DONE = 'BUILD_DONE';

export default function send(message) {
  if (process.send) {
    debug(`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}
