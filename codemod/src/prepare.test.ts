import { join } from 'path';
import { prepare } from './prepare';

test('collect', async () => {
  const { fileCache } = await prepare({
    cwd: join(__dirname, '../fixtures/prepare'),
    pattern: ['**/*.{ts,tsx,js,jsx}'],
  });
  expect(fileCache.size).toEqual(1);
  expect(fileCache.get('foo.ts')).toContain(`1111;`);
});
