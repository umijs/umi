import { fsExtra } from '@umijs/utils';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import path, { join } from 'path';
import rimraf from 'rimraf';
import { getPatchesHash } from './patchesHashUtil';

describe('getPatchesHash', () => {
  const fixtureDir = join(__dirname, '../../fixtures/depInfo/dir-dep');

  beforeEach(() => {
    fsExtra.ensureDirSync(join(fixtureDir, 'patches'));
  });
  afterEach(() => {
    rimraf.sync(fixtureDir);
  });

  test('with no patches dir', () => {
    rimraf.sync(join(fixtureDir, 'patches'));
    expect(getPatchesHash(fixtureDir)).toStrictEqual({});
  });

  test('return same hash if no file changed in patches', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    const hash1 = getPatchesHash(fixtureDir);
    const hash2 = getPatchesHash(fixtureDir);
    expect(hash1).toStrictEqual(hash2);
  });

  test('changes when patch dir changed', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    const hash1 = getPatchesHash(fixtureDir);
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'b.patch'));
    const hash2 = getPatchesHash(fixtureDir);
    expect(hash1).not.toStrictEqual(hash2);
  });

  test('ignore any dir and !*.patch files', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    const hash1 = getPatchesHash(fixtureDir);
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'b'));
    const hash2 = getPatchesHash(fixtureDir);
    expect(hash1).toStrictEqual(hash2);
    fsExtra.ensureDirSync(join(fixtureDir, 'patches', 'b.patch'));
    const hash3 = getPatchesHash(fixtureDir);
    expect(hash1).toStrictEqual(hash3);
  });
});
