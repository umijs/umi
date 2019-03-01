import { join } from 'path';
import { existsSync, renameSync } from 'fs';
import mkdirp from 'mkdirp';
import build from './build';

describe('umi-library build', () => {
  require('test-build-result')({
    root: join(__dirname, './fixtures/build'),
    build({ cwd }) {
      return build({ cwd })
        .then(() => {
          ['es', 'lib'].forEach(dir => {
            const absDirPath = join(cwd, dir);
            const absDistPath = join(cwd, 'dist');
            if (existsSync(absDirPath)) {
              mkdirp.sync(absDistPath);
              renameSync(absDirPath, join(absDistPath, dir));
            }
          });
        });
    },
  });
});
