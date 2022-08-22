import { join } from 'path';
import { getBinPath, getFileNameByPath } from './index';

test('getBinPath', () => {
  expect(getBinPath()).toBe(join(__dirname, '../node_modules/tsx/dist/cli.js'));
});

test('getFileNameByPath', () => {
  expect(getFileNameByPath('/a/b/c.ts')).toBe('c.ts');
});
