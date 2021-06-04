import { join } from 'path';
import winPath from '../winPath/winPath';
import parseRequireDeps from './parseRequireDeps';

const fixtures = join(__dirname, 'fixtures');

test('normal', () => {
  const fixture = join(fixtures, 'normal');
  const ret = parseRequireDeps(join(fixture, '.umirc.ts')).map((p) =>
    p.replace(winPath(fixture), '.'),
  );
  expect(ret).toEqual(['./.umirc.ts', './config/foo.ts', './src/a.js']);
});

test('directory index', () => {
  const fixture = join(fixtures, 'directory-index');
  const ret = parseRequireDeps(join(fixture, 'config/config.ts')).map((p) =>
    p.replace(winPath(fixture), '.'),
  );
  expect(ret).toEqual([
    './config/config.ts',
    './utils/index.tsx',
    './src/foo.ts',
  ]);
});

test('avoid cycle', () => {
  const fixture = join(fixtures, 'cycle');
  const ret = parseRequireDeps(join(fixture, 'a.ts')).map((p) =>
    p.replace(winPath(fixture), '.'),
  );
  expect(ret).toEqual(['./a.ts', './b.ts', './c.ts']);
});
