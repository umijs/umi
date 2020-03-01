const transform = require('./helpers/transformers/javascript');

const processed = transform.process(
  `
import { m } from './merge';
class A {}
console.log(m);
`,
  'index.ts',
  {
    automock: false,
    browser: false,
    cache: true,
    cacheDirectory:
      '/private/var/folders/s8/vkxjf21s6bl76mjqswh9xsqw0000gn/T/jest_dx',
    clearMocks: false,
    coveragePathIgnorePatterns: ['/node_modules/'],
    cwd: '/Users/chencheng/Code/github.com/umijs/umi',
    dependencyExtractor: null,
    detectLeaks: undefined,
    detectOpenHandles: undefined,
    displayName: undefined,
    errorOnDeprecated: false,
    extraGlobals: undefined,
    filter: null,
    forceCoverageMatch: [],
    globalSetup: null,
    globalTeardown: null,
    globals: {},
    haste: {
      computeSha1: false,
      providesModuleNodeModules: [],
      throwOnModuleCollision: false,
    },
    moduleDirectories: ['node_modules'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleLoader: undefined,
    moduleNameMapper: {},
    modulePathIgnorePatterns: [],
    modulePaths: undefined,
    name: '9a5ec82199247b562659f347d59489be',
    prettierPath: 'prettier',
    resetMocks: false,
    resetModules: false,
    resolver: null,
    restoreMocks: false,
    rootDir: '/Users/chencheng/Code/github.com/umijs/umi',
    roots: ['/Users/chencheng/Code/github.com/umijs/umi'],
    runner: 'jest-runner',
    setupFiles: [
      '/Users/chencheng/Code/github.com/umijs/umi/packages/test/helpers/setupFiles/shim.js',
    ],
    setupFilesAfterEnv: [
      '/Users/chencheng/Code/github.com/umijs/umi/packages/test/helpers/setupFiles/jasmine.js',
    ],
    skipFilter: false,
    skipNodeResolution: undefined,
    snapshotResolver: undefined,
    snapshotSerializers: [],
    testEnvironment:
      '/Users/chencheng/Code/github.com/umijs/umi/node_modules/jest-environment-jsdom/build/index.js',
    testEnvironmentOptions: {},
    testLocationInResults: false,
    testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
    testPathIgnorePatterns: ['/node_modules/'],
    testRegex: [],
    testRunner:
      '/Users/chencheng/Code/github.com/umijs/umi/node_modules/jest-jasmine2/build/index.js',
    testURL: 'http://localhost',
    timers: 'real',
    transform: [
      [
        '^.+\\.[jt]sx?$',
        '/Users/chencheng/Code/github.com/umijs/umi/node_modules/jest-config/node_modules/babel-jest/build/index.js',
      ],
    ],
    transformIgnorePatterns: ['/node_modules/'],
    unmockedModulePathPatterns: undefined,
    watchPathIgnorePatterns: [],
  },
  {},
);

console.log(processed.code);
