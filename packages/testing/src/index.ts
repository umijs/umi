import type { Config } from '@jest/types';
import { Path, TransformerConfig } from '@jest/types/build/Config';
import { join } from 'path';

export type JSTransformer = 'esbuild' | 'swc' | 'ts-jest';

export type { Config };

/**
 * 返回给定 jsTransformer 的 transformer 配置
 * @param {JSTransformer} JSTransformer 要使用的JS transformer
 * @param {config}  传递给 build 的配置
 * @returns 转下去 transformer
 */
function getJSTransformer(
  jsTransformer: JSTransformer,
  opts?: any,
): TransformerConfig | Path {
  switch (jsTransformer) {
    case 'esbuild':
      return [
        require.resolve(join(__dirname, 'transformers/esbuild')),
        { ...opts, sourcemap: true },
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
 * createConfig 的配置
 */
export type CreateConfigType = {
  /**
   * 转化 js 的配置
   * @type {'esbuild' | 'swc' | 'ts-jest'}
   */
  jsTransformer?: JSTransformer;
  jsTransformerConfig?: {
    esBuildConfig?: {
      jsxFactory?: string;
      jsxFragment?: string;
    };
  };
  /**
   * 运行环境，node 和 浏览器
   * @type {'node' | 'browser'}
   */
  target?: 'node' | 'browser';
  jsTransformerOpts?: any;
}): Config.InitialOptions {
  const config: Config.InitialOptions = {
    testMatch: ['**/*.test.(t|j)s(x)?'],
    transform: {
      '^.+\\.(t|j)sx?$': getJSTransformer(
        opts?.jsTransformer || 'esbuild',
        opts?.jsTransformerOpts,
      ),
    },
    moduleNameMapper: {
      '^.+\\.(css|less|sass|scss|stylus)$':
        require.resolve('identity-obj-proxy'),
    },
    testTimeout: 30000,
    modulePathIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '<rootDir>/packages/.+/fixtures',
    ],
    setupFiles: [require.resolve('../setupFiles/shim')],
  };
  if (opts?.target === 'browser') {
    config.testEnvironment = 'jsdom';
  }
  return config;
}
