import type { Config } from '@jest/types';
import { mergeConfig } from '../utils/mergeConfig/mergeConfig';

export interface UmiTestJestConfig
  extends Omit<
    Config.InitialOptions,
    'collectCoverageFrom' | 'transformIgnorePatterns' | 'moduleNameMapper'
  > {
  collectCoverageFrom?:
    | Config.InitialOptions['collectCoverageFrom']
    | ((
        memo: Config.InitialOptions['collectCoverageFrom'],
      ) => Config.InitialOptions['collectCoverageFrom']);
  transformIgnorePatterns?:
    | Config.InitialOptions['transformIgnorePatterns']
    | ((
        memo: Config.InitialOptions['transformIgnorePatterns'],
      ) => Config.InitialOptions['transformIgnorePatterns']);
  moduleNameMapper?:
    | Config.InitialOptions['moduleNameMapper']
    | ((
        memo: Config.InitialOptions['moduleNameMapper'],
      ) => Config.InitialOptions['moduleNameMapper']);
}

export interface UmiTestJestOptions {
  hasE2e?: boolean;
  useEsbuild?: boolean;
}

export function createJestConfig(
  config: UmiTestJestConfig,
  options: UmiTestJestOptions = {},
): UmiTestJestConfig {
  const jestDefaults: Config.DefaultOptions = require('jest-config').defaults;
  const { useEsbuild = false, hasE2e = true } = options;
  const testMatchTypes = ['spec', 'test'];
  if (hasE2e) {
    testMatchTypes.push('e2e');
  }
  const umiRootDir = process.env.APP_ROOT || process.cwd();

  const umiTestDefaultsConfig: Config.InitialOptions = {
    testEnvironment: require.resolve('jest-environment-jsdom'),
    setupFiles: [require.resolve('../../helpers/jsdom.js')],
    setupFilesAfterEnv: [require.resolve('../../helpers/setupTests.js')],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    testRunner: require.resolve('jest-circus/runner'),
    runner: require.resolve('jest-runner'),
    collectCoverageFrom: [
      'packages/*/src/**/*.{js,jsx,ts,tsx}',
      'src/**/*.{js,jsx,ts,tsx}',
      '!**/.umi/**',
      '!**/.umi-production/**',
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.d.ts',
    ].filter(Boolean),
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    modulePaths: [],
    moduleNameMapper: {
      '^.+\\.module\\.(css|sass|scss)$': require.resolve('identity-obj-proxy'),
      // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
      //   './helpers/fileMock',
      // ),
      '^@/(.*)$': `${umiRootDir}/src/$1`,
      '^@@/(.*)$': `${umiRootDir}/src/.umi/$1`,
    },
    resetMocks: true,
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname',
    ],
    testMatch: [`**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      ...(useEsbuild
        ? {
            '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': [
              require.resolve('esbuild-jest'),
              {
                sourcemap: false,
                loaders: {
                  '.spec.ts': 'tsx',
                  '.test.ts': 'tsx',
                },
              },
            ],
          }
        : {
            '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': require.resolve(
              '../../helpers/babelTransform.js',
            ),
          }),
      '^.+\\.css$': require.resolve('../../helpers/cssTransform.js'),
      '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': require.resolve(
        '../../helpers/fileTransform.js',
      ),
    },
    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS
      ? { maxWorkers: Number(process.env.MAX_WORKERS) }
      : {}),
  };
  const jestConfig = mergeConfig<UmiTestJestConfig, Config.InitialOptions>(
    jestDefaults,
    umiTestDefaultsConfig,
    config,
  );

  return jestConfig;
}
