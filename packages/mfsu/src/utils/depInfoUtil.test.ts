import { fsExtra } from '@umijs/utils';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import path, { join } from 'path';
import { getDepHash } from './depInfoUtil';

describe('getDepHash', () => {
  const getHash = (content) => {
    return createHash('sha256').update(content).digest('hex').substring(0, 8);
  };
  const lockfileContent = 'Hello World';
  const fixtureDir = join(__dirname, '../../fixtures/depInfo');

  afterEach(() => {
    fsExtra.emptyDirSync(fixtureDir);
  });

  test('normal npm/pnpm/yarn repo', () => {
    const filenames = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
    const expected = getHash(lockfileContent);

    filenames.forEach((filename) => {
      const fullPath = join(fixtureDir, filename);
      writeFileSync(fullPath, lockfileContent);
      const hash = getDepHash(fixtureDir);
      expect(hash).toBe(expected);
      fsExtra.rmSync(fullPath);
    });
  });

  test('npm/yarn with patches dir', () => {
    const filenames = ['package-lock.json', 'yarn.lock'];
    const expected = getHash(lockfileContent);

    fsExtra.ensureDirSync(join(fixtureDir, 'patches'));
    filenames.forEach((filename) => {
      const fullPath = join(fixtureDir, filename);
      writeFileSync(fullPath, lockfileContent);
      const hash = getDepHash(fixtureDir);
      expect(hash).not.toBe(expected);
      fsExtra.rmSync(fullPath);
    });
  });

  test('pnpm should ignore patches dir', () => {
    const filename = 'pnpm-lock.yaml';
    const expected = getHash(lockfileContent);

    fsExtra.ensureDirSync(join(fixtureDir, 'patches'));
    const fullPath = join(fixtureDir, filename);
    writeFileSync(fullPath, lockfileContent);
    const hash = getDepHash(fixtureDir);
    expect(hash).toBe(expected);
  });
});
