import { execFileSync } from 'child_process';
import { existsSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getFileCreateInfo, getFileLastModifyInfo } from './getFileGitIno';

const createGitRepo = () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umijs-utils-git-'));

  execFileSync('git', ['init'], { cwd, stdio: 'ignore' });
  writeFileSync(join(cwd, 'index.ts'), 'export default 1;\n');
  execFileSync('git', ['add', 'index.ts'], { cwd, stdio: 'ignore' });
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Umi Test',
      '-c',
      'user.email=umi-test@example.com',
      'commit',
      '-m',
      'init',
    ],
    { cwd, stdio: 'ignore' },
  );

  return cwd;
};

describe('getFileGitIno', () => {
  let cwd: string;

  afterEach(() => {
    if (cwd) {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test('gets file create and last modify info', async () => {
    cwd = createGitRepo();

    await expect(getFileCreateInfo('index.ts', cwd)).resolves.toMatchObject({
      creator: 'Umi Test',
      creatorEmail: 'umi-test@example.com',
    });
    await expect(getFileLastModifyInfo('index.ts', cwd)).resolves.toMatchObject(
      {
        modifier: 'Umi Test',
        modifierEmail: 'umi-test@example.com',
      },
    );
  });

  const testOrSkip = process.platform === 'win32' ? test.skip : test;

  testOrSkip(
    'does not execute shell metacharacters in file paths',
    async () => {
      cwd = mkdtempSync(join(tmpdir(), 'umijs-utils-git-'));
      const marker = join(cwd, 'pwned');
      const payload = `x;touch ${marker};#`;

      await getFileCreateInfo(payload, cwd).catch(() => {});
      expect(existsSync(marker)).toBe(false);

      await getFileLastModifyInfo(payload, cwd).catch(() => {});
      expect(existsSync(marker)).toBe(false);

      if (existsSync(marker)) {
        unlinkSync(marker);
      }
    },
  );
});
