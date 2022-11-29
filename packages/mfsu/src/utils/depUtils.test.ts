import path from 'path';
import { lookupLockfile } from './depUtils';

describe('lookupLockfile', () => {
  let basedir = path.join(__dirname, '../../fixtures/agentSamples');
  let rootDir = path.join(__dirname, '../../');

  test('with a non-PackageManager repo', () => {
    expect(lookupLockfile(path.join(basedir, 'empty-repo'), rootDir)).toBe('');
  });

  test('with a pnpm repo', () => {
    expect(lookupLockfile(path.join(basedir, 'pnpm'))).toBe('pnpm');
  });

  test('with a npm repo', () => {
    expect(lookupLockfile(path.join(basedir, 'npm'))).toBe(
      JSON.stringify('hello world'),
    );
  });

  test('with a yarn repo', () => {
    expect(lookupLockfile(path.join(basedir, 'yarn'))).toBe('yarn');
  });

  test('with a pnpm monorepo', () => {
    expect(lookupLockfile(path.join(basedir, 'pnpm-monorepo/a/b'))).toBe(
      'pnpm-monorepo',
    );
  });

  test('with a yarn workspace', () => {
    expect(lookupLockfile(path.join(basedir, 'yarn-workspace/a'))).toBe(
      'yarn-workspace',
    );
  });
});
