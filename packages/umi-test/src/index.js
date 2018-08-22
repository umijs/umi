import jest from 'jest';
import { join } from 'path';
import { existsSync } from 'fs';

const debug = require('debug')('umi-test');

process.env.NODE_ENV = 'test';

export default function(opts = {}) {
  const { cwd = process.cwd(), moduleNameMapper } = opts;

  const jestConfigFile = join(cwd, 'jest.config.js');
  let userJestConfig = {};
  if (existsSync(jestConfigFile)) {
    userJestConfig = require(jestConfigFile); // eslint-disable-line
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
      ...(moduleNameMapper || {}),
    },
    globals: {
      'ts-jest': {
        useBabelrc: true,
      },
    },
    ...(userJestConfig || {}),
  };

  return new Promise((resolve, reject) => {
    jest
      .runCLI(
        {
          config: JSON.stringify(config),
          ...opts,
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
