const debug = require('debug')('af-webpack:send');

export const COMPILING = 'COMPILING';
export const DONE = 'DONE';
export const STARTING = 'STARTING';
export const RESTART = 'RESTART';
export const OPEN_FILE = 'OPEN_FILE';

export default function send(message) {
  if (process.send) {
    debug(`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}
