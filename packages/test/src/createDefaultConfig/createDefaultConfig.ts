// @ts-ignore
import { isLernaPackage, winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import assert from 'assert';

import { IUmiTestArgs } from '../types';

export default function (cwd: string, args: IUmiTestArgs) {
  const { OPEN_AUTO_E2E_FOR_UMI_TEST } = process.env;
  const testMatchTypes = ['spec', 'test'];
  const { e2e } = args;
  const isAutoE2e = OPEN_AUTO_E2E_FOR_UMI_TEST === 'OPEN';
  if (e2e) {
    testMatchTypes.push('e2e');
  }
  const isLerna = isLernaPackage(cwd);
  const hasPackage = isLerna && args.package;
  const testMatchPrefix = hasPackage ? `**/packages/${args.package}/` : '';

  const hasSrc = existsSync(join(cwd, 'src'));

  if (hasPackage) {
    assert(
      existsSync(join(cwd, 'packages', args.package!)),
      `You specified --package, but packages/${args.package} does not exists.`,
    );
  }

  return {
    collectCoverageFrom: [
      'index.{js,jsx,ts,tsx}',
      hasSrc && 'src/**/*.{js,jsx,ts,tsx}',
      isLerna && !args.package && 'packages/*/src/**/*.{js,jsx,ts,tsx}',
      isLerna &&
        args.package &&
        `packages/${args.package}/src/**/*.{js,jsx,ts,tsx}`,
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.d.ts',
    ].filter(Boolean),
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss|stylus)$': require.resolve('identity-obj-proxy'),
    },
    setupFiles: [require.resolve('../../helpers/setupFiles/shim')],
    setupFilesAfterEnv: [require.resolve('../../helpers/setupFiles/jasmine')],
    testEnvironment: isAutoE2e
      ? winPath(join(__dirname, '../e2e/PuppeteerEnvironment'))
      : require.resolve('jest-environment-jsdom-fourteen'),
    testMatch: isAutoE2e
      ? [`${testMatchPrefix}**/**.e2e.(j|t)s?(x)`]
      : [
          `${testMatchPrefix}**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`,
          // 之所以做这件事情是为了更高的性能，启动 chrome 也是需要耗费性能的
          // 不需要 chrome 的就不需要启动了，现在还无法做到自动，只能通过这种方式
          ...(OPEN_AUTO_E2E_FOR_UMI_TEST === 'CLOSE'
            ? [`!${testMatchPrefix}**/**.e2e.(j|t)s?(x)`]
            : []),
        ],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': require.resolve(
        '../../helpers/transformers/javascript',
      ),
      '^.+\\.(css|less|sass|scss|stylus)$': require.resolve(
        '../../helpers/transformers/css',
      ),
      '^(?!.*\\.(js|jsx|ts|tsx|css|less|sass|scss|stylus|json)$)': require.resolve(
        '../../helpers/transformers/file',
      ),
    },
    verbose: true,
    transformIgnorePatterns: [
      // 加 [^/]*? 是为了兼容 tnpm 的目录结构
      // 比如：_umi-test@1.5.5@umi-test
      // `node_modules/(?!([^/]*?umi|[^/]*?umi-test)/)`,
    ],
    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS
      ? { maxWorkers: Number(process.env.MAX_WORKERS) }
      : {}),
  };
}
