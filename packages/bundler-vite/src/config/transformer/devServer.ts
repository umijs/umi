import type { IConfigProcessor } from '.';

/**
 * transform umi devServer to vite server
 */
export default (function devServer(userConfig) {
  const config: ReturnType<IConfigProcessor> = { server: {} };

  ['port', 'host', 'https', 'poxy'].forEach(field => {
    if (userConfig.devServer?.[field]) {
      // @ts-ignore
      config.server![field] = userConfig.devServer[field];
    }
  });

  return config;
}) as IConfigProcessor;
