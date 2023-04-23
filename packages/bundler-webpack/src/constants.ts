export const DEFAULT_DEVTOOL = 'cheap-module-source-map';
export const DEFAULT_OUTPUT_PATH = 'dist';
export const MFSU_NAME = 'MFSU';

export enum MESSAGE_TYPE {
  ok = 'ok',
  warnings = 'warnings',
  errors = 'errors',
  hash = 'hash',
  stillOk = 'still-ok',
  invalid = 'invalid',
}

export const DEFAULT_BROWSER_TARGETS = {
  chrome: 80,
};

export const DEFAULT_ESBUILD_TARGET_KEYS = [
  'chrome',
  'firefox',
  'edge',
  'safari',
];
