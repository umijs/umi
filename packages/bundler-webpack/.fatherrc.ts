import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  cjs: {
    ignores: ['src/client/**'],
  },
  esm: {
    output: 'client',
    ignores: [
      '!src/client/**',
      '!src/constants.ts',
      '!src/utils/formatWebpackMessages.ts',
    ],
    transformer: 'esbuild',
    overrides: {
      'src/client': {
        // 使用 babel 避免 esbuild 处理成 cjs 模块导致 HMR 失效
        // ref: https://github.com/evanw/esbuild/issues/1940
        transformer: 'babel',
        output: 'client/client',
      },
    },
  },
});
