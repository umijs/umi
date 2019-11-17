const debug = require('debug')('umiui:UmiUI');
export const debugSocket = debug.extend('socket');
export const debugTerminal = debug.extend('terminal');

export default debug;
