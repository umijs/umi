import { join } from 'path';
import getCwd from './getCwd';

let oldAppRoot = process.env.APP_ROOT;

beforeEach(() => {
  oldAppRoot = process.env.APP_ROOT;
});

afterEach(() => {
  process.env.APP_ROOT = oldAppRoot;
});

test('normal', () => {
  const cwd = getCwd();
  expect(cwd).toEqual(process.cwd());
});

test('process.env.APP_ROOT', () => {
  process.env.APP_ROOT = 'foo/bar';
  const cwd = getCwd();
  expect(cwd).toEqual(join(process.cwd(), 'foo/bar'));
});

test('process.env.APP_ROOT with cwd', () => {
  process.env.APP_ROOT = join(process.cwd(), 'foo/bar');
  const cwd = getCwd();
  expect(cwd).toEqual(join(process.cwd(), 'foo/bar'));
});
