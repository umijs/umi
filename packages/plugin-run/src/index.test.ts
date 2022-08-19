import { join } from 'path';
import { check, getBinPath, getFileNameByPath } from './index';

test('check', () => {
  const t = () => {
    check('a.js');
  };
  expect(t).toThrow('Only typescript files can be run');
});
test('getBinPath', () => {
  expect(getBinPath()).toBe(join(__dirname, '../node_modules/tsx/dist/cli.js'));
});
test('getFileNameByPath', () => {
  expect(getFileNameByPath('/a/b/c.ts')).toBe('c.ts');
});
