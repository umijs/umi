export const MIN_NODE_VERSION = 14;
export const DEV_COMMAND = 'dev';
export const FRAMEWORK_NAME = process.env.FRAMEWORK_NAME || 'umi';
export const DEFAULT_CONFIG_FILES = [
  `.${FRAMEWORK_NAME}rc.ts`,
  `.${FRAMEWORK_NAME}rc.js`,
  'config/config.ts',
  'config/config.js',
];

export const RUNTIME_TYPE_FILE_NAME = 'runtimeConfig.d.ts';
