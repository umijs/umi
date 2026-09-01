import { ESLint } from '@utoo/lint';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { getUtooLintConfig } from '.';

describe('utoo-lint config', () => {
  const projects: string[] = [];

  afterEach(() => {
    for (const project of projects.splice(0)) {
      rmSync(project, { force: true, recursive: true });
    }
  });

  it('keeps JavaScript and TypeScript rule scopes separate', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'umi-utoo-lint-'));
    projects.push(cwd);
    mkdirSync(join(cwd, 'src'));
    writeFileSync(join(cwd, 'src/index.js'), 'var value = 1;\n');
    writeFileSync(join(cwd, 'src/index.ts'), 'var value = 1;\n');

    const results = await new ESLint({
      baseConfig: getUtooLintConfig(),
      cwd,
      noConfig: true,
    }).lintFiles(['src']);
    const messages = Object.fromEntries(
      results.map((result) => [
        basename(result.filePath),
        result.messages.map((message) => message.ruleId),
      ]),
    );

    expect(messages['index.js']).toEqual(['no-var']);
    expect(messages['index.ts']).toEqual([
      'no-var',
      '@typescript-eslint/no-unused-vars',
    ]);
  });

  it('maps equivalent rules and omits unsupported rules', () => {
    const [recommended, typescript, jest] = getUtooLintConfig();

    expect(recommended.rules).toMatchObject({
      'no-global-assign': 2,
      'no-var': 2,
    });
    expect(recommended.rules).not.toHaveProperty('no-native-reassign');
    expect(recommended.rules).not.toHaveProperty(
      'react/no-direct-mutation-state',
    );
    expect(typescript.rules).not.toHaveProperty(
      '@typescript-eslint/no-invalid-this',
    );
    expect(jest.rules).not.toHaveProperty('jest/no-focused-tests');
  });

  it('allows project config to override the built-in rules', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'umi-utoo-lint-'));
    projects.push(cwd);
    mkdirSync(join(cwd, 'src'));
    writeFileSync(join(cwd, 'src/index.js'), 'var value = 1;\n');
    writeFileSync(
      join(cwd, 'utlint.config.json'),
      JSON.stringify({ rules: { 'no-var': 'off' } }),
    );

    const results = await new ESLint({
      baseConfig: getUtooLintConfig(),
      cwd,
    }).lintFiles(['src']);

    expect(results[0].messages).toEqual([]);
  });
});
