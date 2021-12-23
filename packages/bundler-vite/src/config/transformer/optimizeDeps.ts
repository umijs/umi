import type { IConfigProcessor } from '.';

/**
 * transform user config to vite optimizeDeps config
 */
export default (function optimizeDeps(userConfig) {
  const config: ReturnType<IConfigProcessor> = {
    // configure pre-bundling entries
    optimizeDeps: { entries: Object.values(userConfig.entry) },
  };

  // include alias which within node_modules for optimize dependencies
  if (typeof userConfig.alias === 'object') {
    config.optimizeDeps!.include = Object.keys(userConfig.alias).filter(
      (name) => userConfig.alias[name].includes('node_modules'),
    );
  }

  return config;
} as IConfigProcessor);
