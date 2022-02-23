import type { Config } from '@jest/types';

export function configUmiAlias() {}

export enum JSTransformer {
  esbuild = 'esbuild',
  swc = 'swc',
  tsJest = 'ts-jest',
}

export type { Config };

function getJSTransformer(jsTransformer: JSTransformer) {
  switch (jsTransformer || JSTransformer.esbuild) {
    case JSTransformer.esbuild:
      return require.resolve('esbuild-jest');
    case JSTransformer.swc:
      return require.resolve('@swc-node/jest');
    case JSTransformer.tsJest:
      return require.resolve('ts-jest');
    default:
      throw new Error(`Unknown jsTransformer: ${jsTransformer}`);
  }
}

export function createConfig(opts: {
  jsTransformer: JSTransformer;
}): Config.InitialOptions {
  return {
    testMatch: ['**/*.test.(j|t)sx?'],
    transform: {
      // alternatives:
      // 1. @swc-node/jest
      // 2. ts-jest
      '^.+\\.tsx?$': getJSTransformer(opts.jsTransformer),
    },
    testTimeout: 30000,
    modulePathIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '<rootDir>/packages/.+/fixtures',
    ],
  };
}
