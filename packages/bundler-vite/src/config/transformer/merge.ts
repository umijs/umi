import type { IConfigProcessor } from '.';

/**
 * Merge from user config
 */
export default (function merge(userConfig) {
  if (typeof userConfig.vite === 'object') {
    return userConfig.vite;
  }
} as IConfigProcessor);
