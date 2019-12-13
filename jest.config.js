const testMatchPrefix = process.env.PACKAGE ? `**/packages/${process.env.PACKAGE}/src/**` : '**';
const collectCoveragePrefix = process.env.PACKAGE ? process.env.PACKAGE : '**';

module.exports = {
  testMatch:
    process.env.E2E === 'none'
      ? [`${testMatchPrefix}/?*.(spec|test).(j|t)s?(x)`]
      : [`${testMatchPrefix}/?*.(spec|test|e2e).(j|t)s?(x)`],
  moduleNameMapper: {},
  testPathIgnorePatterns: [],
  setupFilesAfterEnv: [],
  collectCoverageFrom: [`packages/${collectCoveragePrefix}/src/**/*.{js,jsx,ts,tsx}`],
  watchPathIgnorePatterns: [],
  coveragePathIgnorePatterns: [],
};
