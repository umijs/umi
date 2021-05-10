import { join } from 'path';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import runGenerator from './index';
import download from './utils/download';

const fixtures = join(__dirname, 'fixtures');
const cwd = join(fixtures, 'generate');

test('generate app', async () => {
  await runGenerator({
    cwd,
    args: {
      _: [],
      $0: '',
    },
  });
  expect(existsSync(join(cwd, 'src', 'pages', 'index.tsx'))).toEqual(true);
  rimraf.sync(cwd);
});

test('generate example app', async () => {
  const exampleName = 'example';
  await runGenerator({
    cwd: fixtures,
    args: {
      _: [exampleName],
      example: 'normal',
      $0: '',
    },
  });
  const target = join(fixtures, exampleName, 'pages', 'index.tsx');
  expect(existsSync(target)).toEqual(true);
  rimraf.sync(join(fixtures, exampleName));
});

test('example is no found', async () => {
  await expect(
    runGenerator({
      cwd: fixtures,
      args: {
        _: [],
        example: 'normal123',
        $0: '',
      },
    }),
  ).rejects.toThrow(/umi example: normal123 is no found/);
});

test('download pkg create-umi', async () => {
  const exampleName = 'example';

  const temp = {
    name: exampleName,
    url: 'https://github.com/xiaohuoni/umi-start-template',
    path: '',
  };
  await download(fixtures, temp);
  const target = join(fixtures, exampleName, 'src', 'pages', 'index.js');
  expect(existsSync(target)).toEqual(true);
  const removefile = join(fixtures, exampleName, 'something.js');
  expect(existsSync(removefile)).toEqual(false);
  rimraf.sync(join(fixtures, exampleName));
});

test('download error repo', async () => {
  const exampleName = 'example';

  const temp = {
    name: exampleName,
    url: 'https://github.com/xiaohuoni/download-error-repo',
    path: '',
  };
  await expect(download(fixtures, temp)).rejects.toThrow(
    'HTTPError: Response code 404 (Not Found)',
  );
});
