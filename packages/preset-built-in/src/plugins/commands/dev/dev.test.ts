import { Service } from '@umijs/core';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');
let WATCH = process.env.WATCH;

beforeAll(() => {
  process.env.WATCH = 'none';
});

afterAll(() => {
  process.env.WATCH = WATCH;
});

test('dev', async () => {
  const cwd = join(fixtures, 'dev');

  const compileDone = () =>
    new Promise((resolve) => {
      service.on('firstDevCompileDone', () => {
        resolve(true);
      });
    });

  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
    env: 'development',
  });

  // @ts-ignore
  const { destroy, compilerMiddleware: instance } = await service.run({
    name: 'dev',
  });

  const res = await compileDone();
  expect(res).toBeTruthy();
  // fix test webpack not exit
  if (instance.context.watching.closed) {
    destroy();
  }
  instance.close(() => {
    destroy();
  });
});

test('dev-writeToDisk', async () => {
  const cwd = join(fixtures, 'dev-writeToDisk');
  const distPath = join(cwd, 'dist');

  const compileDone = () =>
    new Promise((resolve) => {
      service.on('firstDevCompileDone', () => {
        resolve(true);
      });
    });

  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
    env: 'development',
  });

  // @ts-ignore
  const { destroy, compilerMiddleware: instance } = await service.run({
    name: 'dev',
  });
  destroy();
  const res = await compileDone();
  expect(res).toBeTruthy();
  expect(existsSync(join(distPath, 'index.html'))).toBeTruthy();
  rimraf.sync(distPath);
  // fix test webpack not exit
  if (instance.context.watching.closed) {
    destroy();
  }
  instance.close(() => {
    destroy();
  });
});
