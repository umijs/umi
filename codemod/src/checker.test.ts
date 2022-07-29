import { join } from 'path';
import { Checker } from './checker';
import { prepare } from './prepare';
import { Context } from './types';

test('normal', async () => {
  process.env.GIT_CHECK = 'none';
  const cwd = join(__dirname, '../fixtures/prepare/normal');
  const context: Context = await prepare({
    cwd,
    pattern: ['**/*.{ts,tsx,js,jsx}'],
  });
  const spy = jest.spyOn(global.console, 'error');
  await new Checker({ cwd, context }).run();
  expect(global.console.error).not.toBeCalled();
  spy.mockRestore();
  process.env.GIT_CHECK = 'true';
});

test('alita', async () => {
  process.env.GIT_CHECK = 'none';
  const cwd = join(__dirname, '../fixtures/prepare/alita');
  const context: Context = await prepare({
    cwd,
    pattern: ['**/*.{ts,tsx,js,jsx}'],
  });
  const spy = jest.spyOn(global.console, 'error');
  await new Checker({ cwd, context }).run();
  expect(global.console.error).not.toBeCalled();
  spy.mockRestore();
  process.env.GIT_CHECK = 'true';
});

// test('alita', async () => {
//   const { importSource, fileCache, deps } = await prepare({
//     cwd: join(__dirname, '../fixtures/prepare/alita'),
//     pattern: ['**/*.{ts,tsx,js,jsx}'],
//   });
//   expect(fileCache.size).toEqual(1);
//   expect(fileCache.get('foo.ts')).toContain(`1111;`);
//   expect(importSource).toBe('alita');
//   expect(deps.includes?.['antd-mobile']).toBe('2.3.4');
// });
