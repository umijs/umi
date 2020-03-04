import { join } from 'path';
import getPkg from './getPkg';

const fixtures = join(__dirname, 'fixtures');

let oldAppRoot = process.env.APP_ROOT;
let oldCwd = process.cwd();

beforeEach(() => {
  oldAppRoot = process.env.APP_ROOT;
  oldCwd = process.cwd();
});

afterEach(() => {
  process.env.APP_ROOT = oldAppRoot;
  process.chdir(oldCwd);
});

test('no APP_ROOT, pkg retrieved in specified dir', () => {
  process.chdir(fixtures);
  const pkg = getPkg(join(fixtures, 'normal'));
  expect(pkg.name).toEqual('normal');
});

test('no APP_ROOT, pkg not found in specified dir', () => {
  const pkg = getPkg(fixtures);
  expect(pkg).toEqual(null);
});

test('with abs APP_ROOT, pkg retrieved in APP_ROOT', () => {
  process.env.APP_ROOT = join(fixtures, 'normal');
  const pkg = getPkg('');
  expect(pkg.name).toEqual('normal');
});

test('with abs APP_ROOT & dir, pkg not found in APP_ROOT, fallback to specfic dir', () => {
  process.env.APP_ROOT = '/no-way/';
  const pkg = getPkg(join(fixtures, 'normal'));
  expect(pkg.name).toEqual('normal');
});

test('with abs APP_ROOT & dir, pkg not found in both APP_ROOT and dir, null should return', () => {
  process.env.APP_ROOT = '/no-way/';
  const pkg = getPkg('/hello/');
  expect(pkg).toEqual(null);
});

test('with relative APP_ROOT, pkg retrieved in APP_ROOT', () => {
  process.env.APP_ROOT = 'packages/umi/src/utils/fixtures/normal';
  const pkg = getPkg('');
  expect(pkg.name).toEqual('normal');
});

test('with relative APP_ROOT & dir, pkg not found in APP_ROOT, fallback to specfic dir', () => {
  process.env.APP_ROOT = 'no-way';
  const pkg = getPkg(join(fixtures, 'normal'));
  expect(pkg.name).toEqual('normal');
});

test('with relative APP_ROOT & dir, pkg not found in both APP_ROOT and dir, null should return', () => {
  process.env.APP_ROOT = 'no-way/hello/';
  const pkg = getPkg('/hello/');
  expect(pkg).toEqual(null);
});
