import { relative, join } from 'path';
import winPath from './winPath';
import compatDirname from './compatDirname';

const fixtures = join(__dirname, 'fixtures', 'compatDirname');
const FALLBACK = '__fallback__';

test('no pkg', () => {
  expect(compatDirname('a', join(fixtures, 'no-pkg'), FALLBACK)).toEqual(FALLBACK);
  expect(compatDirname('a', join(fixtures, 'no-pkg'))).toEqual(undefined);
});

test('pkg', () => {
  const fixture = join(fixtures, 'have-pkg');
  expect(winPath(relative(fixture, compatDirname('a/package.json', fixture)))).toEqual(
    'node_modules/a',
  );
  expect(compatDirname('b/package.json', fixture)).toEqual(undefined);
});
