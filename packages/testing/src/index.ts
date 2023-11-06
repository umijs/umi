import type { Config } from '@jest/types';
import { Path, TransformerConfig } from '@jest/types/build/Config';
import { setNoDeprecation } from '@umijs/utils';
import { join } from 'path';

export type JSTransformer = 'esbuild' | 'swc' | 'ts-jest';

export type { Config };

/**
 * 返回给定 jsTransformer 的 transformer 配置
 * @param {JSTransformer} JSTransformer 要使用的JS transformer
 * @param {config}  传递给 build 的配置
 * @returns 下去 transformer
 */
function getJSTransformer(
  jsTransformer: JSTransformer,
  opts?: any,
): TransformerConfig | Path {
  switch (jsTransformer) {
    case 'esbuild':
      return [
        require.resolve(join(__dirname, 'transformers/esbuild')),
        {
          // See https://github.com/umijs/umi/issues/10412
          target: 'es2020',
          ...opts,
          sourcemap: true,
        },
      ];
    case 'swc':
      return require.resolve('@swc-node/jest');
    case 'ts-jest':
      return require.resolve('ts-jest');
    default:
      throw new Error(`Unknown jsTransformer: ${jsTransformer}`);
  }
}

/**
 * 创建一份jest 的配置
 * 增加了'esbuild' | 'swc' | 'ts-jest' 的 transform
 * 增加 css|less|sass|scss|stylus 的支持
 * 默认编译 所有的 node_modules
 * @param  {{jsTransformer?:JSTransformer;target?:'node'|'browser';jsTransformerOpts?:any;}} opts?
 * @returns Config
 */
export function createConfig(opts?: {
  /**
   * 转化 js 的配置
   * @type {'esbuild' | 'swc' | 'ts-jest'}
   */
  jsTransformer?: JSTransformer;

  /**
   * 运行环境，node 和 浏览器
   * @type {'node' | 'browser'}
   */
  target?: 'node' | 'browser';
  jsTransformerOpts?: any;
}): Config.InitialOptions {
  setNoDeprecation();
  const config: Config.InitialOptions = {
    testMatch: ['**/*.test.(t|j)s(x)?'],
    testPathIgnorePatterns: [
      '/node_modules/',
      '<rootDir>/config/', // in case of config.test.ts
      '<rootDir>/mock/',
      '<rootDir>/.umirc.test.ts',
    ],
    transform: {
      '^.+\\.(t|j)sx?$': getJSTransformer(
        opts?.jsTransformer || 'esbuild',
        opts?.jsTransformerOpts,
      ),
      '^.+\\.mjs$': getJSTransformer(
        opts?.jsTransformer || 'esbuild',
        opts?.jsTransformerOpts,
      ),
    },
    moduleNameMapper: {
      '^.+\\.(css|less|sass|scss|stylus)$':
        require.resolve('identity-obj-proxy'),
    },
    testTimeout: 30000,
    transformIgnorePatterns: [`/node_modules/(?!${[].join('|')})`],
    modulePathIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '<rootDir>/packages/.+/fixtures',
    ],
    setupFiles: [require.resolve('../setupFiles/shim')],
    resolver: require.resolve('./resolver.js'),
  };
  if (opts?.target === 'browser') {
    config.testEnvironment = 'jsdom';
  }
  return config;
}
