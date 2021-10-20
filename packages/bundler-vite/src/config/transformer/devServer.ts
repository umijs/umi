import type { IConfigProcessor } from '.';

/**
 * transform umi devServer to vite server
 */
export default (function devServer(userConfig) {
  const config: ReturnType<IConfigProcessor> = { server: {} };

  // transform devServer umi config
  ['port', 'host', 'https'].forEach(field => {
    if (userConfig.devServer?.[field]) {
      // @ts-ignore
      config.server![field] = userConfig.devServer[field];
    }
  });

  // proxy is a top-level umi config
  if (userConfig.proxy) {
    config.server!.proxy = userConfig.proxy;
  }

  return config;
}) as IConfigProcessor;
