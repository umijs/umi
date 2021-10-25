import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import prompts from '../../compiled/prompts';
import rimraf from '../../compiled/rimraf';
import Generator from './BaseGenerator';

const fixtures = join(__dirname, './fixtures');
const cwd = join(fixtures, 'generate');

const generate = async ({
  path,
  target,
  data,
  questions,
}: {
  path: string;
  target: string;
  data?: any;
  questions?: prompts.PromptObject[];
}) => {
  const generator = new Generator({
    path,
    target,
    data,
    questions,
  });

  await generator.run();
};

test('generate tpl', async () => {
  await generate({
    path: join(fixtures, 'tpl'),
    target: join(cwd, 'hello/', ''),
  });
  expect(existsSync(join(cwd, 'hello', 'index.tsx'))).toEqual(true);
  rimraf.sync(join(cwd, 'hello'));
});

test('generate tpl file', async () => {
  await generate({
    path: join(fixtures, 'tpl', 'index.tsx.tpl'),
    target: join(cwd, 'file-tpl'),
  });
  expect(existsSync(join(cwd, 'file-tpl', 'index.tsx'))).toEqual(true);
  rimraf.sync(join(cwd, 'file-tpl'));
});

test('generate by file', async () => {
  await generate({
    path: join(fixtures, 'tpl', 'a.tsx'),
    target: join(cwd, 'file'),
  });
  expect(existsSync(join(cwd, 'file', 'a.tsx'))).toEqual(true);
  rimraf.sync(join(cwd, 'file'));
});

test('generate tpl by data', async () => {
  await generate({
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
  rimraf.sync(join(cwd, 'data'));
});
