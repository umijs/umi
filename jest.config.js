module.exports = {
  testURL: 'http://localhost/',
  testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/examples/',
    '/lib/',
    '/packages/umi/src/scripts/test.js',
    '/packages/umi/src/test.js',
    '/packages/umi-build-dev/src/routes/fixtures',
    '/packages/umi-plugin-dva/src/fixtures',
    '/packages/umi-utils/src/fixtures',
  ],
  collectCoverageFrom: ['packages/**/src/**/*.{js,jsx}'],
  coveragePathIgnorePatterns: [
    '/packages/umi-plugin-dva/src/fixtures',
    '/packages/umi-build-dev/src/plugins/commands/generate/generators',
  ],
};
