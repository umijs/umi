export const DEFAULT_DEVTOOL = 'cheap-module-source-map';
export const DEFAULT_OUTPUT_PATH = 'dist';

export enum MESSAGE_TYPE {
  ok = 'ok',
  warnings = 'warnings',
  errors = 'errors',
  hash = 'hash',
  stillOk = 'still-ok',
  invalid = 'invalid',
}
