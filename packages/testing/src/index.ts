import type { Config } from '@jest/types';

export type JSTransformer = 'esbuild' | 'swc' | 'ts-jest';

export type { Config };

function getJSTransformer(jsTransformer: JSTransformer) {
  switch (jsTransformer) {
    case 'esbuild':
      return require.resolve('esbuild-jest');
    case 'swc':
      return require.resolve('@swc-node/jest');
    case 'ts-jest':
      return require.resolve('ts-jest');
    default:
      throw new Error(`Unknown jsTransformer: ${jsTransformer}`);
  }
}
export function createConfig(opts?: {
  jsTransformer?: JSTransformer;
  target?: 'node' | 'browser';
}): Config.InitialOptions {
  const config: Config.InitialOptions = {
    testMatch: ['**/*.test.(t|j)s(x)?'],
    transform: {
      '^.+\\.tsx?$': getJSTransformer(opts?.jsTransformer || 'esbuild'),
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
