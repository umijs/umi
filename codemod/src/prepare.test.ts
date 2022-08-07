import { join } from 'path';
import { prepare } from './prepare';

test('normal', async () => {
  const { fileCache } = await prepare({
    cwd: join(__dirname, '../fixtures/prepare/normal'),
    pattern: ['**/*.{ts,tsx,js,jsx}'],
  });
  expect(fileCache.size).toEqual(1);
  expect(fileCache.get('foo.ts')).toContain(`1111;`);
});

test('max', async () => {
  const { fileCache } = await prepare({
    cwd: join(__dirname, '../fixtures/prepare/max'),
    pattern: ['**/*.{ts,tsx,js,jsx}'],
  });
  expect(fileCache.size).toEqual(1);
  expect(fileCache.get('foo.ts')).toContain(`1111;`);
});

test('alita', async () => {
  const { importSource, fileCache, deps } = await prepare({
    cwd: join(__dirname, '../fixtures/prepare/alita'),
    pattern: ['**/*.{ts,tsx,js,jsx}'],
  });
  expect(fileCache.size).toEqual(1);
  expect(fileCache.get('foo.ts')).toContain(`1111;`);
  expect(importSource).toBe('alita');
  expect(deps.includes?.['antd-mobile']).toBe('2.3.4');
});
