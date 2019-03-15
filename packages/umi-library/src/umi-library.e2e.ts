import { join } from 'path';
import { fork } from 'child_process';
import { existsSync, renameSync } from 'fs';

const binPath = join(__dirname, '../bin/umi-library.js');

describe('umi-library doc build', () => {
  process.env.COMPRESS = 'none';
  process.env.IS_TEST = 'true';

  require('test-build-result')({
    root: join(__dirname, './fixtures/e2e'),
    build({ cwd }) {
      return new Promise(resolve => {
        const child = fork(binPath, ['doc', 'build'], {
          cwd,
          env: process.env,
        });
        child.on('exit', code => {
          expect(code).toEqual(0);
          const child = fork(binPath, ['build', '--esm'], {
            cwd,
          });
          child.on('exit', code => {
            expect(code).toEqual(0);

            const absDirPath = join(cwd, '.docz/dist');
            if (existsSync(absDirPath)) {
              renameSync(absDirPath, join(cwd, 'dist/docz'));
            } else {
              throw new Error(`.docz/dist not exists`);
            }

            resolve();
          });
        });
      });
    },
  });
});
