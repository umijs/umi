import jest from 'jest';
import { join } from 'path';
import { existsSync } from 'fs';

const debug = require('debug')('umi-test');

process.env.NODE_ENV = 'test';

export default function(opts = {}) {
  const { cwd = process.cwd(), moduleNameMapper } = opts;
  let transformInclude = opts.transformInclude || [];
  if (typeof transformInclude === 'string') {
    transformInclude = [transformInclude];
  }

  const jestConfigFile = join(cwd, 'jest.config.js');
  let userJestConfig = {};
  if (existsSync(jestConfigFile)) {
    userJestConfig = require(jestConfigFile); // eslint-disable-line
  }

  const {
    moduleNameMapper: userModuleNameMapper,
    ...restUserJestConfig
  } = userJestConfig;

  const config = {
    rootDir: process.cwd(),
    setupFiles: [
      require.resolve('./shim.js'),
      require.resolve('./setupTests.js'),
    ],
    resolver: require.resolve('jest-pnp-resolver'),
    transform: {
      '\\.(t|j)sx?$': require.resolve('./transformers/jsTransformer'),
      '\\.svg$': require.resolve('./transformers/fileTransformer'),
    },
    transformIgnorePatterns: [
      `node_modules/(?!(umi|enzyme-adapter-react-16|${transformInclude.join(
        '|',
      )})/)`,
    ],
    testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    setupFilesAfterEnv: [require.resolve('./jasmine')],
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': require.resolve('identity-obj-proxy'),
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
        './fileMock.js',
      ),
      ...(moduleNameMapper || {}),
      ...(userModuleNameMapper || {}),
    },
    testPathIgnorePatterns: ['/node_modules/'],
    ...(restUserJestConfig || {}),
  };

  delete opts.transformInclude;

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
