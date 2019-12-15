import jest from 'jest';
// @ts-ignore
import { createDebug, mergeConfig } from '@umijs/utils';
import { options as CliOptions } from 'jest-cli/build/cli/args';
import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';
import createDefaultConfig from './createDefaultConfig/createDefaultConfig';
import { IArgs } from './types';

const debug = createDebug('umi:test');

export default async function(args: IArgs) {
  process.env.NODE_ENV = 'test';

  if (args.debug) {
    createDebug.enable('umi:test');
  }

  debug(`args: ${JSON.stringify(args)}`);

  // Print related versions
  if (args.version) {
    console.log(`umi-test@${require('../package.json').version}`);
    console.log(`jest@${require('jest/package.json').version}`);
    return;
  }

  const cwd = args.cwd || process.cwd();

  // Read config from cwd/jest.config.js
  const userJestConfigFile = join(cwd, 'jest.config.js');
  const userJestConfig =
    existsSync(userJestConfigFile) && require(userJestConfigFile);
  debug(`config from jest.config.js: ${JSON.stringify(userJestConfig)}`);

  // Read jest config from package.json
  const packageJSONPath = join(cwd, 'package.json');
  const packageJestConfig =
    existsSync(packageJSONPath) && require(packageJSONPath).jest;
  debug(`jest config from package.json: ${JSON.stringify(packageJestConfig)}`);

  // Merge configs
  // user config and args config could have value function for modification
  const config = mergeConfig(
    createDefaultConfig(cwd, args),
    packageJestConfig,
    userJestConfig,
  );
  debug(`final config: ${JSON.stringify(config)}`);

  // Generate jest options
  const argsConfig = {};
  Object.keys(CliOptions).forEach(name => {
    if (args[name]) argsConfig[name] = name;

    // Convert alias args into real one
    const { alias } = CliOptions[name];
    if (alias && args[alias]) {
      argsConfig[name] = args[alias];
    }
  });
  debug(`config from args: ${JSON.stringify(argsConfig)}`);

  // Run jest
  const result = await jest.runCLI(
    {
      _: args._ || [],
      $0: args.$0 || '',
      // 必须是单独的 config 配置，值为 string，否则不生效
      config: JSON.stringify(config),
      ...argsConfig,
    },
    [cwd],
  );
  debug(result);

  // Throw error when run failed
  assert(result.results.success, `Test with jest failed`);
}
