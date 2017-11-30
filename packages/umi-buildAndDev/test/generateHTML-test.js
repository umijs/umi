import expect from 'expect';
import glob from 'glob';
import { join } from 'path';
import { readFileSync as readFile } from 'fs';
import generateHTML from '../src/generateHTML';

const fixture = join(__dirname, './fixtures/generateHTML');

function assertBuildResult(cwd) {
  const actualDir = join(cwd, 'dist');
  const expectDir = join(cwd, 'expected');

  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });
  const expectFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  expect(actualFiles.length).toEqual(expectFiles.length);

  actualFiles.forEach(file => {
    const actualFile = readFile(join(actualDir, file), 'utf-8');
    const expectFile = readFile(join(expectDir, file), 'utf-8');
    expect(actualFile.trim()).toEqual(expectFile.trim());
  });
}

xdescribe('generateHTML', () => {
  it('normal', () => {
    const cwd = join(fixture, 'normal');
    generateHTML(
      {
        '/a.html': './page/a.js',
        '/b/b.html': './page/b.js',
        '/c.html': './page/c.js',
      },
      {
        cwd,
      },
    );
    assertBuildResult(cwd);
  });

  it('document.ejs in page', () => {
    const cwd = join(fixture, 'document');
    generateHTML(
      {
        '/a.html': './page/a.js',
      },
      {
        cwd,
      },
    );
    assertBuildResult(cwd);
  });
});
