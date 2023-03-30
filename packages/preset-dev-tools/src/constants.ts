import { join } from 'path';

export const TEMPLATES_DIR = join(__dirname, '../templates');

export enum MESSAGE_TYPE {
  ok = 'ok',
  warnings = 'warnings',
  errors = 'errors',
  hash = 'hash',
  stillOk = 'still-ok',
  invalid = 'invalid',
}

export const SOCKET_DIR_NAME = 'plugin-ui-socket';
