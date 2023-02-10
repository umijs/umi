import { defineConfig } from 'father';

export default defineConfig({
  extends: '../.fatherrc.base.ts',
  prebundle: {
    deps: {
      'terminal-link': {
        minify: false,
        dts: true,
      },
    },
  },
});
