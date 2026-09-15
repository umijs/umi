import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import rimraf from 'rimraf';
import { runUtlint } from './utlint';

let cwd: string;
const originalExitCode = process.exitCode;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'umi-utlint-'));
  const pkgDir = join(cwd, 'node_modules/@utoo/lint');
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, 'package.json'),
    JSON.stringify({ bin: { 'utoo-lint': './cli.cjs' } }),
  );
  writeFileSync(
    join(pkgDir, 'cli.cjs'),
    `require('fs').writeFileSync('result.json', JSON.stringify({
      cwd: process.cwd(), args: process.argv.slice(2),
      migration: process.env.UMI_UTLINT_MIGRATE
    }));
    process.exitCode = Number(process.argv[2]) || 0;`,
  );
  process.exitCode = 0;
});

afterEach(() => {
  process.exitCode = originalExitCode;
  rimraf.sync(cwd);
});

test('uses the project-installed CLI and project working directory', async () => {
  await runUtlint(cwd, ['--fix', 'src/a file.ts']);
  // On macOS tmpdir() may be a symlink, so compare against the real path.
  expect(JSON.parse(readFileSync(join(cwd, 'result.json'), 'utf8'))).toEqual({
    cwd: realpathSync(cwd),
    args: ['--fix', 'src/a file.ts'],
    migration: '0',
  });
  expect(process.exitCode).toBe(0);
});

test('enables the config-only migration environment only in the child', async () => {
  const original = process.env.UMI_UTLINT_MIGRATE;
  await runUtlint(cwd, ['migrate', 'eslint', '--print']);
  expect(
    JSON.parse(readFileSync(join(cwd, 'result.json'), 'utf8')).migration,
  ).toBe('1');
  expect(process.env.UMI_UTLINT_MIGRATE).toBe(original);
});

test.each([1, 2])('preserves CLI failure exit code %s', async (code) => {
  await runUtlint(cwd, [String(code)]);
  expect(process.exitCode).toBe(code);
});

test('reports a missing optional dependency with installation guidance', async () => {
  rimraf.sync(join(cwd, 'node_modules'));
  await expect(runUtlint(cwd, [])).rejects.toThrow('npm install -D @utoo/lint');
});
