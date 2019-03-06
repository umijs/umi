import { join } from 'path';
import { existsSync, readdirSync, renameSync } from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import build from './build';

describe('umi-library build', () => {
  require('test-build-result')({
    root: join(__dirname, './fixtures/build'),
    build({ cwd }) {
      rimraf.sync(join(cwd, 'dist'));
      return build({ cwd }).then(() => {
        // babel
        ['es', 'lib'].forEach(dir => {
          const absDirPath = join(cwd, dir);
          const absDistPath = join(cwd, 'dist');
          if (existsSync(absDirPath)) {
            mkdirp.sync(absDistPath);
            renameSync(absDirPath, join(absDistPath, dir));
          }
        });

        // lerna
        if (existsSync(join(cwd, 'lerna.json'))) {
          mkdirp.sync(join(cwd, 'dist'));
          const pkgs = readdirSync(join(cwd, 'packages'));
          for (const pkg of pkgs) {
            renameSync(
              join(cwd, 'packages', pkg, 'dist'),
              join(cwd, 'dist', pkg),
            );
          }
        }
      });
    },
  });
});
