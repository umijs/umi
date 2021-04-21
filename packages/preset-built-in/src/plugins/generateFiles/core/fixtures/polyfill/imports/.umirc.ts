import { dirname, join } from 'path';
import { pkgUp } from '@umijs/utils';

export default {
  presets: [
    join(
      dirname(
        pkgUp.sync({
          cwd: __dirname,
        })!,
      ),
      'src/index.ts',
    ),
  ],
  polyfill: {
    imports: ['core-js/es/array', 'core-js/proposals/math-extensions'],
  },
};
