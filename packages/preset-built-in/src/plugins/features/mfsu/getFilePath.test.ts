import { join } from 'path';
import { getFilePath } from './getFilePath';

const fixtures = join(__dirname, 'fixtures', 'getFilePath');

function format(path: string | null) {
  if (!path) return path;
  return path.replace(fixtures, '$CWD$');
}

test('file exists', () => {
  expect(
    format(getFilePath(join(fixtures, 'js-file-first', 'foo.js'))),
  ).toEqual(`$CWD$/js-file-first/foo.js`);
});

test('js file first', () => {
  expect(format(getFilePath(join(fixtures, 'js-file-first', 'foo')))).toEqual(
    `$CWD$/js-file-first/foo.js`,
  );
});

test('package json second', () => {
  expect(
    format(getFilePath(join(fixtures, 'package-json-second', 'foo'))),
  ).toEqual(`$CWD$/package-json-second/foo/bar.js`);
});

test('directory index third', () => {
  expect(
    format(getFilePath(join(fixtures, 'directory-index-third', 'foo'))),
  ).toEqual(`$CWD$/directory-index-third/foo/index.js`);
});

test('directory index mjs', () => {
  expect(
    format(getFilePath(join(fixtures, 'directory-index-mjs', 'foo'))),
  ).toEqual(`$CWD$/directory-index-mjs/foo/index.mjs`);
});
