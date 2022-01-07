import type { IConfigProcessor } from '.';

/**
 * transform umi alias to vite alias
 */
export default (function alias(userConfig) {
  const config: ReturnType<IConfigProcessor> = {};

  if (typeof userConfig.alias === 'object') {
    config.resolve = {
      alias: Object.entries<string>(userConfig.alias).map(([name, target]) => ({
        // supports webpack suffix $ and less-loader prefix ~
        // example:
        //   - dep => ^~?dep(?=\/|$)
        //   - dep$ => ^~?dep$
        find: new RegExp(`^~?${name.replace(/(?<!\$)$/, '(?=/|$)')}`),
        replacement: target,
      })),
    };
  }

  return config;
} as IConfigProcessor);
