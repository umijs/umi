import { join, dirname } from 'path';
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
};
