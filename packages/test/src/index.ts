import jest from 'jest';
import { debugFactory } from '@umijs/utils';
import { options as CliOptions } from 'jest-cli/build/cli/args';
import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';
import defaultConfig from './defaultConfig';
import mergeConfig from './mergeConfig';

const debug = debugFactory('umi:test');

interface IArgs {
  _?: string[];
  $0?: string;
  version?: boolean;
  cwd?: string;
}

export default async function(args: IArgs) {
  if (args.version) {
    console.log(`umi-test@${require('../package.json').version}`);
    console.log(`jest@${require('jest/package.json').version}`);
    process.exit(0);
  }

  const cwd = args.cwd || process.cwd();
  const userJestConfigFile = join(cwd, 'jest.config.js');
  const userJestConfig = existsSync(userJestConfigFile) ? require(userJestConfigFile) : {};

  // Convert alias args into real one
  const argsConfig = {};
  Object.keys(CliOptions).forEach(name => {
    const { alias } = CliOptions[name] || {};
    if (alias && args[alias]) {
      argsConfig[name] = args[alias];
    }
  });

  const config = mergeConfig(defaultConfig, userJestConfig, argsConfig);

  const result = await jest.runCLI(
    {
      _: args._ || [],
      $0: args.$0 || '',
      setupFiles: [],
    },
    [cwd],
  );

  assert(result.results.success, `Test with jest failed`);
}
