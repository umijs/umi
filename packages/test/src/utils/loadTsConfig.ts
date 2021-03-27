// Load the TypeScript configuration
import { Config } from '@jest/types';
import { Service } from 'ts-node';
import { interopRequireDefault } from 'jest-util';

export default async (
  configPath: Config.Path,
): Promise<Config.InitialOptions> => {
  let registerer: Service;

  // Register TypeScript compiler instance
  try {
    registerer = require('ts-node').register({
      compilerOptions: {
        module: 'CommonJS',
      },
    });
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `Jest: 'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${e.message}`,
      );
    }

    throw e;
  }

  registerer.enabled(true);

  let configObject = interopRequireDefault(require(configPath)).default;

  // In case the config is a function which imports more Typescript code
  if (typeof configObject === 'function') {
    configObject = await configObject();
  }

  registerer.enabled(false);

  return configObject;
};
