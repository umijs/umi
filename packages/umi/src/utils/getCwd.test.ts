import { join } from 'path';
import getCwd from './getCwd';

test('normal', () => {
  const cwd = getCwd();
  expect(cwd).toEqual(process.cwd());
});

test('process.env.APP_ROOT', () => {
  const oldAppRoot = process.env.APP_ROOT;
  process.env.APP_ROOT = 'foo/bar';
  const cwd = getCwd();
  expect(cwd).toEqual(join(process.cwd(), 'foo/bar'));
  process.env.APP_ROOT = oldAppRoot;
});
