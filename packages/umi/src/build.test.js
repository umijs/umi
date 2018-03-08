import expect from 'expect';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import glob from 'glob';
import build from './build';

function assertBuildResult(cwd) {
  const actualDir = join(cwd, 'dist');
  const expectDir = join(cwd, 'expected');

  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });
  const expectFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  expect(actualFiles.length).toEqual(expectFiles.length);

  actualFiles.forEach(file => {
    if (file.indexOf('static/') > -1) return;
    // don't assert umi.js, since it's too big
    // if (file.indexOf('umi.js') > -1 || file.indexOf('umi.css') > -1) return;

    const actualFile = readFileSync(join(actualDir, file), 'utf-8');
    const expectFile = readFileSync(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

xdescribe('build', () => {
  process.env.COMPRESS = 'none';
  process.env.ESLINT = 'none';
  process.env.TSLINT = 'none';

  const fixtures = join(__dirname, '../test/fixtures/build');
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
            done(e);
          });
      });
    });
});
