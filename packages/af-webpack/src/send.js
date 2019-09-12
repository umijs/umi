const debug = require('debug')('af-webpack:send');

export const DONE = 'DONE';
export const ERROR = 'ERROR';
export const STATS = 'STATS';
export const STARTING = 'STARTING';
export const RESTART = 'RESTART';

export default function send(message) {
  if (process.send) {
    debug(`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}
