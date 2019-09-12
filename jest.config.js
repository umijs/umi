const testMatchPrefix = process.env.PACKAGE ? `**/packages/${process.env.PACKAGE}/**` : '**';
const collectCoveragePrefix = process.env.PACKAGE ? process.env.PACKAGE : '**';

module.exports = {
  testMatch:
    process.env.E2E === 'none'
      ? [`${testMatchPrefix}/?*.(spec|test).(j|t)s?(x)`]
      : [`${testMatchPrefix}/?*.(spec|test|e2e).(j|t)s?(x)`],
  moduleNameMapper: {
    '^umi/_runtimePlugin$': require.resolve('./packages/umi/lib/runtimePlugin'),
  },
  testPathIgnorePatterns: [
    '/.git/',
    '/node_modules/',
    '/examples/',
    '/lib/',
    '/packages/umi/src/scripts/test.js',
    '/packages/umi/src/test.js',
    '/packages/umi-build-dev/src/fixtures',
    '/packages/umi-build-dev/src/routes/fixtures',
    '/packages/umi-plugin-dva/src/fixtures',
    '/packages/umi-utils/src/fixtures',
    '/packages/umi/test/fixtures',
  ],
  setupFilesAfterEnv: ['./jasmine.js'],
  collectCoverageFrom: [
    `packages/${collectCoveragePrefix}/src/**/*.{js,jsx,ts,tsx}`,
    '!**/ui.umd.js',
    '!**/fixtures/**',
    '!**/ui/**',
    '!**/examples/**',
    '!**/locales/**',
    '!**/typings/**',
    '!**/types/**',
  ],
  coveragePathIgnorePatterns: [
    '/packages/umi-plugin-auto-externals/src/types',
    '/packages/umi-ui/client',
    '/packages/umi-test',
    '/packages/umi-build-dev/src/plugins/commands/generate/generators',
  ],
};
