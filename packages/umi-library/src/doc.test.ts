import { join } from 'path';
import { existsSync, renameSync } from 'fs';
import { devOrBuild } from './doc';

xdescribe('umi-library doc build', () => {
  process.env.COMPRESS = 'none';
  require('test-build-result')({
    root: join(__dirname, './fixtures/doc'),
    build({ cwd }) {
      return devOrBuild({ cwd, cmd: 'build', params: [], docConfig: {} }).then(
        () => {
          const absDirPath = join(cwd, '.docz/dist');
          if (existsSync(absDirPath)) {
            renameSync(absDirPath, join(cwd, 'dist'));
          } else {
            throw new Error(`.docz/dist not exists`);
          }
        },
      );
    },
  });
});
