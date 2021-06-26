// @ts-ignore
import {
  BabelRegister,
  compatESModuleRequire,
  createDebug,
  mergeConfig,
} from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { runCLI } from 'jest';
import { options as CliOptions } from 'jest-cli/build/cli/args';
import { join } from 'path';
import createDefaultConfig from './createDefaultConfig/createDefaultConfig';
import { IUmiTestArgs, PickedJestCliOptions } from './types';

const debug = createDebug('umi:test');

export * from './utils';

const useJestConfig = ['jest.config.js', 'jest.config.ts'];
const babelRegister = new BabelRegister();

export default async function (args: IUmiTestArgs) {
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
  const userJestConfigFiles = useJestConfig.map((configName) =>
    join(cwd, configName),
  );

  const userJestConfig = userJestConfigFiles.find((configCwd) =>
    existsSync(configCwd),
  );

  if (userJestConfig) {
    babelRegister.setOnlyMap({ key: 'jest-config', value: [userJestConfig] });
  }
  debug(`jest config: ${JSON.stringify(userJestConfig)}`);

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
    userJestConfig ? compatESModuleRequire(require(userJestConfig)) : {},
  );
  debug(`final config: ${JSON.stringify(config)}`);

  // Generate jest options
  const argsConfig = Object.keys(CliOptions).reduce((prev, name) => {
    if (args[name]) prev[name] = args[name];

    // Convert alias args into real one
    const { alias } = CliOptions[name];
    if (alias && args[alias]) prev[name] = args[alias];
    return prev;
  }, {} as PickedJestCliOptions);
  debug(`config from args: ${JSON.stringify(argsConfig)}`);

  // Run jest
  const result = await runCLI(
    {
      // @ts-ignore
      _: args._ || [],
      // @ts-ignore
      $0: args.$0 || '',
      // 必须是单独的 config 配置，值为 string，否则不生效
      // @ts-ignore
      config: JSON.stringify(config),
      ...argsConfig,
    },
    [cwd],
  );
  debug(result);

  // Throw error when run failed
  assert(result.results.success, `Test with jest failed`);
}
