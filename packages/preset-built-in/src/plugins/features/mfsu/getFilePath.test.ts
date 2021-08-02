import { winPath } from '@umijs/utils';
import { join } from 'path';
import { getFilePath, getProperCwd } from './getFilePath';

const fixtures = join(__dirname, 'fixtures', 'getFilePath');

function format(path: string | null) {
  if (!path) return path;
  return winPath(path).replace(winPath(fixtures), '$CWD$');
}

let oldAppRoot = process.env.APP_ROOT;
let oldCwd = process.cwd();

beforeEach(() => {
  oldAppRoot = process.env.APP_ROOT;
  oldCwd = process.cwd();
});

afterEach(() => {
  process.env.APP_ROOT = oldAppRoot;
  process.chdir(oldCwd);
});

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

test('package json not found module', () => {
  expect(
    format(getFilePath(join(fixtures, 'package-json-not-found-module', 'foo'))),
  ).toEqual(`$CWD$/package-json-not-found-module/foo/bar.js`);
});

test('package json directory', () => {
  expect(
    format(getFilePath(join(fixtures, 'package-json-directory', 'foo'))),
  ).toEqual(`$CWD$/package-json-directory/foo/bar/index.js`);
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

test('cwd should be APP_ROOT', () => {
  process.chdir(join(fixtures, 'package-json-in-approot'));
  process.env.APP_ROOT = join(fixtures, 'package-json-in-approot', 'app');
  expect(format(getProperCwd(process.env.APP_ROOT))).toEqual(
    `$CWD$/package-json-in-approot/app`,
  );
});

test('cwd should be process.cwd()', () => {
  process.chdir(join(fixtures, 'package-json-notin-approot'));
  process.env.APP_ROOT = join(fixtures, 'package-json-notin-approot', 'app');
  expect(format(getProperCwd(process.env.APP_ROOT))).toEqual(
    `$CWD$/package-json-notin-approot`,
  );
});
