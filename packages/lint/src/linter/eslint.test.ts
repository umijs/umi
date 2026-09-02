import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import EsLinter from './eslint';

describe('EsLinter', () => {
  const projects: string[] = [];

  afterEach(() => {
    process.exitCode = undefined;
    for (const project of projects.splice(0)) {
      rmSync(project, { force: true, recursive: true });
    }
    jest.restoreAllMocks();
  });

  it('passes lint targets to utoo-lint', () => {
    const linter = new EsLinter({ cwd: process.cwd() });

    expect(
      linter.getRunArgs({
        _: ['src/index.ts'],
        fix: true,
        quiet: true,
      }),
    ).toEqual(['src/index.ts']);
  });

  it('honors quiet for project warning overrides', () => {
    const cwd = createProject({ 'no-var': 'warn' }, 'var value = 1;\n');
    const stdout = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    new EsLinter({ cwd }).run({ _: ['src'], quiet: true });

    expect(process.exitCode).toBeUndefined();
    expect(stdout).not.toHaveBeenCalledWith(expect.stringContaining('no-var'));
  });

  it('applies fixes supported by utoo-lint', () => {
    const cwd = createProject(
      { 'no-extra-semi': 'error', 'no-var': 'off' },
      'const value = 1;;\n',
    );
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    new EsLinter({ cwd }).run({ _: ['src'], fix: true });

    expect(readFileSync(join(cwd, 'src/index.js'), 'utf8')).toBe(
      'const value = 1;\n',
    );
    expect(process.exitCode).toBeUndefined();
  });

  function createProject(rules: Record<string, string>, source: string) {
    const cwd = mkdtempSync(join(tmpdir(), 'umi-utoo-lint-'));
    projects.push(cwd);
    mkdirSync(join(cwd, 'src'));
    writeFileSync(join(cwd, 'src/index.js'), source);
    writeFileSync(join(cwd, 'utlint.config.json'), JSON.stringify({ rules }));
    return cwd;
  }
});
