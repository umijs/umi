module.exports = {
  testURL: 'http://localhost/',
  testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/examples/',
    '/lib/',
    '/packages/umi/src/scripts/test.js',
    '/packages/umi/src/test.js',
    '/packages/umi-plugin-dva/src/fixtures',
  ],
  collectCoverageFrom: ['packages/**/src/**/*.{ts,tsx,js,jsx}'],
  coveragePathIgnorePatterns: ['/packages/umi-plugin-dva/src/fixtures'],
};
