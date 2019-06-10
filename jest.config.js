module.exports = {
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
  collectCoverageFrom: ['packages/**/src/**/*.{js,jsx}'],
  coveragePathIgnorePatterns: [
    '/packages/umi-plugin-dva/src/fixtures',
    '/packages/umi-build-dev/src/fixtures',
    '/packages/umi-build-dev/src/routes/fixtures',
    '/packages/umi-build-dev/src/plugins/commands/generate/generators',
    '/packages/umi-utils/src/fixtures',
    '/packages/umi/test/fixtures',
  ],
};
