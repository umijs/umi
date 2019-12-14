import jest from 'jest';
import { createDebug, mergeConfig } from '@umijs/utils';
import { options as CliOptions } from 'jest-cli/build/cli/args';
import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';
import defaultConfig from './defaultConfig';

const debug = createDebug('umi:test');

interface IArgs {
  _?: string[];
  $0?: string;
  version?: boolean;
  cwd?: string;
  debug?: boolean;
}

export default async function(args: IArgs) {
  process.env.NODE_ENV = 'test';

  if (args.debug) {
    createDebug.enable('umi:test');
  }

  // Print related versions
  if (args.version) {
    console.log(`umi-test@${require('../package.json').version}`);
    console.log(`jest@${require('jest/package.json').version}`);
    process.exit(0);
  }

  const cwd = args.cwd || process.cwd();
  const userJestConfigFile = join(cwd, 'jest.config.js');
  const userJestConfig = existsSync(userJestConfigFile)
    ? require(userJestConfigFile)
    : {};
  debug(`config from jest.config.js: ${JSON.stringify(userJestConfig)}`);

  // Convert alias args into real one
  const argsConfig = {};
  Object.keys(CliOptions).forEach(name => {
    const { alias } = CliOptions[name] || {};
    if (alias && args[alias]) {
      argsConfig[name] = args[alias];
    }
  });
  debug(`config from args: ${JSON.stringify(argsConfig)}`);

  // Merge configs
  // user config and args config could have value function for modification
  const config = mergeConfig(defaultConfig, userJestConfig, argsConfig);
  debug(`final config: ${JSON.stringify(config)}`);
  const result = await jest.runCLI(
    {
      _: args._ || [],
      $0: args.$0 || '',
      // 必须是单独的 config 配置，值为 string，否则不生效
      config: JSON.stringify(config),
      // ...config,
    },
    [cwd],
  );
  debug(result);
  // Throw error when run failed
  assert(result.results.success, `Test with jest failed`);
}
