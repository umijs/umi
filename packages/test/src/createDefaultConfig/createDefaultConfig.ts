// @ts-ignore
import { isLernaPackage } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import { IUmiTestArgs } from '../types';

export default function(cwd: string, args: IUmiTestArgs) {
  const testMatchTypes = ['spec', 'test'];
  if (args.e2e) {
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
    testEnvironment: require.resolve('jest-environment-jsdom-fourteen'),
    testMatch: [
      `${testMatchPrefix}**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`,
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
