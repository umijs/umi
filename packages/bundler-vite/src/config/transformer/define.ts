import type { IConfigProcessor } from '.';

/**
 * transform umi define to vite define
 */
export default (function define(userConfig) {
  const config: ReturnType<IConfigProcessor> = { define: {} };

  if (typeof userConfig.define === 'object') {
    // JSON.stringify for define value by default
    Object.keys(userConfig.define).forEach((name) => {
      config.define![name] = JSON.stringify(userConfig.define[name]);
    });
  }

  return config;
} as IConfigProcessor);
