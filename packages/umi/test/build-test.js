import expect from 'expect';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import glob from 'glob';
import build from '../src/build';

function assertBuildResult(cwd) {
  const actualDir = join(cwd, 'dist');
  const expectDir = join(cwd, 'expected');

  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });
  const expectFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  expect(actualFiles.length).toEqual(expectFiles.length);

  actualFiles.forEach(file => {
    // don't assert umi.js, since it's too big
    if (file.indexOf('umi.js') > -1 || file.indexOf('umi.css') > -1) return;

    const actualFile = readFileSync(join(actualDir, file), 'utf-8');
    const expectFile = readFileSync(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

describe('build', () => {
  process.env.NO_COMPRESS = 1;
  process.env.DISABLE_ESLINT = 1;
  process.env.DISABLE_KOIJS_G_CACHE = 1;

  const fixtures = join(__dirname, './fixtures/build');
  readdirSync(fixtures)
    .filter(dir => dir.charAt(0) !== '.')
    .forEach(dir => {
      const fn = dir.indexOf('-only') > -1 ? it.only : it;
      fn(dir, done => {
        const cwd = join(fixtures, dir);
        process.chdir(cwd);
        build({
          cwd,
          hash: false,
          disableCSSModules: true,
          preact: true,
        })
          .then(() => {
            assertBuildResult(cwd);
            done();
          })
          .catch(e => {
            console.log(e);
            done();
          });
      });
    });
});
