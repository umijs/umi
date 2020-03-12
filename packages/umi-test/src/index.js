import jest from 'jest';
import { options as CliOptions } from 'jest-cli/build/cli/args';
import { join } from 'path';
import { existsSync } from 'fs';

const debug = require('debug')('umi-test');

process.env.NODE_ENV = 'test';
process.env.IS_FROM_UMI_TEST = 1;

export default function(originOpts = {}) {
  const opts = { ...originOpts };
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
    extraSetupFiles,
    ...restUserJestConfig
  } = userJestConfig;

  const config = {
    rootDir: process.cwd(),
    setupFiles: [
      require.resolve('./shim.js'),
      require.resolve('./setupTests.js'),
      ...(extraSetupFiles || []),
    ],
    resolver: require.resolve('jest-pnp-resolver'),
    transform: {
      '\\.(t|j)sx?$': require.resolve('./transformers/jsTransformer'),
      '\\.svg$': require.resolve('./transformers/fileTransformer'),
    },
    transformIgnorePatterns: [
      // 加 [^/]*? 是为了兼容 tnpm 的目录结构
      // 比如：_umi-test@1.5.5@umi-test
      `node_modules/(?!([^/]*?umi|[^/]*?umi-test|[^/]*?enzyme-adapter-react-16|${transformInclude.join(
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
    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS ? { maxWorkers: Number(process.env.MAX_WORKERS) } : {}),
    ...(restUserJestConfig || {}),
  };

  delete opts.transformInclude;

  // Convert alias option into real one
  Object.keys(CliOptions).forEach(name => {
    const { alias } = CliOptions[name] || {};
    if (alias && opts[alias]) {
      opts[name] = opts[alias];
      delete opts[alias];
    }
  });

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
