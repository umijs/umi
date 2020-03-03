import { join } from 'path';
import getPkg from './getPkg';

const fixtures = join(__dirname, 'fixtures');

let oldAppRoot = process.env.APP_ROOT;

beforeEach(() => {
  oldAppRoot = process.env.APP_ROOT;
});

afterEach(() => {
  process.env.APP_ROOT = oldAppRoot;
});

test('normal', () => {
  const pkg = getPkg(join(fixtures, 'pkgtest'));
  expect(pkg.name).toEqual('normal');
});

test('null while no package.json found in specific dir', () => {
  const pkg = getPkg(fixtures);
  expect(pkg).toEqual({});
});

test('with relative APP_ROOT', () => {
  process.env.APP_ROOT = 'packages/utils/src/getFile/fixtures/pkgtest';
  const pkg = getPkg(fixtures);
  expect(pkg.name).toEqual('normal');
});

test('with abs APP_ROOT', () => {
  process.env.APP_ROOT = join(fixtures, 'pkgtest');
  const pkg = getPkg(fixtures);
  expect(pkg.name).toEqual('normal');
});

test('no package.json in APP_ROOT dir, fallback with specific dir', () => {
  process.env.APP_ROOT = join(fixtures);
  const pkg = getPkg(join(fixtures, 'pkgtest'));
  expect(pkg.name).toEqual('normal');
});

test('no package.json in both APP_ROOT and specific dir', () => {
  process.env.APP_ROOT = join(fixtures);
  const pkg = getPkg(join(fixtures, 'hello'));
  expect(pkg).toEqual({});
});
