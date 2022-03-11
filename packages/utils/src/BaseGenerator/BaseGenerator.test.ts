import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import rimraf from '../../compiled/rimraf';
import generateFile from './generateFile';

const fixtures = join(__dirname, './fixtures');
const cwd = join(fixtures, 'generate');

const globKeepDotFile = join(cwd, '*');

beforeEach(() => {
  rimraf.sync(globKeepDotFile, { glob: { ignore: ['**/.gitkeep'] } });
});

afterAll(() => {
  rimraf.sync(globKeepDotFile, { glob: { ignore: ['**/.gitkeep'] } });
});

test('generate tpl', async () => {
  await generateFile({
    path: join(fixtures, 'tpl'),
    target: join(cwd, 'hello/', ''),
  });
  expect(existsSync(join(cwd, 'hello', 'index.tsx'))).toEqual(true);
});

test('generate tpl file', async () => {
  await generateFile({
    path: join(fixtures, 'tpl', 'index.tsx.tpl'),
    target: join(cwd, 'file-tpl', 'index.tsx'),
  });
  expect(existsSync(join(cwd, 'file-tpl', 'index.tsx'))).toEqual(true);
});

test('generate by file', async () => {
  await generateFile({
    path: join(fixtures, 'tpl', 'a.tsx'),
    target: join(cwd, 'file', 'a.tsx'),
  });
  expect(existsSync(join(cwd, 'file', 'a.tsx'))).toEqual(true);
});

test('generate tpl by data', async () => {
  await generateFile({
    path: join(fixtures, 'tpl'),
    target: join(cwd, 'data'),
    data: {
      componentName: 'Home',
    },
  });
  expect(existsSync(join(cwd, 'data', 'index.tsx'))).toEqual(true);
  expect(readFileSync(join(cwd, 'data', 'index.tsx'), 'utf-8')).toContain(
    'HomePage',
  );
});
