import jestCli from 'jest-cli';
import { join } from 'path';
import { existsSync, statSync } from 'fs';

const debug = require('debug')('umi-test');

process.env.NODE_ENV = 'test';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export default function(opts = {}) {
  const { watch, coverage, libraryName = 'umi', cwd = process.cwd() } = opts;

  const jestConfigFile = join(cwd, 'jest.config.js');
  let userJestConfig = {};
  if (existsSync(jestConfigFile)) {
    userJestConfig = require(jestConfigFile); // eslint-disable-line
  }

  let pagesPath = 'pages';
  if (test(join(cwd, 'src/page'))) {
    pagesPath = 'src/page';
  }
  if (test(join(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }

  const config = {
    rootDir: process.cwd(),
    setupFiles: [
      require.resolve('./shim.js'),
      require.resolve('./setupTests.js'),
    ],
    transform: {
      '\\.jsx?$': require.resolve('./transformers/jsTransformer'),
      '\\.tsx?$': require.resolve('./transformers/tsTransformer'),
    },
    testMatch: ['**/?(*.)(spec|test|e2e).(j|t)s?(x)'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    setupTestFrameworkScriptFile: require.resolve('./jasmine'),
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': require.resolve('identity-obj-proxy'),
    },
    globals: {
      'ts-jest': {
        useBabelrc: true,
      },
    },
    ...(coverage
      ? {
          collectCoverageFrom: [
            'pages/**/*.{ts,tsx,js,jsx}',
            'src/**/*.{ts,tsx,js,jsx}',
            '!**/*.d.ts',
          ],
          collectCoverage: true,
          coveragePathIgnorePatterns: [
            `/${pagesPath}/.${libraryName}/`,
            `/${pagesPath}/.${libraryName}-production/`,
          ],
        }
      : {}),
    ...(userJestConfig || {}),
  };

  return new Promise((resolve, reject) => {
    jestCli
      .runCLI(
        {
          watch,
          testPathPattern: process.argv
            .slice(2)
            .filter(arg => !arg.startsWith('-')),
          config: JSON.stringify(config),
        },
        [cwd],
      )
      .then(result => {
        debug(result);
        const { results } = result;
        // const success = results.every(result => result.success);
        if (results.success) {
          resolve();
        } else {
          reject(new Error('Jest failed'));
        }
      })
      .catch(e => {
        console.log(e);
      });
  });
}
