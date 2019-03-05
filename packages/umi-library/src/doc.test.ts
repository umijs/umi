import { join } from 'path';
import { existsSync, renameSync } from 'fs';
import build from './doc';

xdescribe('umi-library doc build', () => {
  process.env.COMPRESS = 'none';
  require('test-build-result')({
    root: join(__dirname, './fixtures/doc'),
    build({ cwd }) {
      return build({ cwd, cmd: 'build', params: [] })
        .then(() => {
          const absDirPath = join(cwd, '.docz/dist');
          if (existsSync(absDirPath)) {
            renameSync(absDirPath, join(cwd, 'dist'));
          } else {
            throw new Error(`.docz/dist not exists`);
          }
        });
    },
  });
});
