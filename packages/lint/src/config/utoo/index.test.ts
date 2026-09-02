import { ESLint } from '@utoo/lint';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { getUtooLintConfig } from '.';
import { jestRules } from '../eslint/rules/recommended';

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

  it('runs the newly supported React and Jest rules', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'umi-utoo-lint-'));
    projects.push(cwd);
    mkdirSync(join(cwd, 'src'));
    writeFileSync(
      join(cwd, 'src/component.jsx'),
      [
        `import React from 'react';`,
        'class Component extends React.Component {',
        '  method() { this.state.value = 1; }',
        '  render() { return null; }',
        '}',
      ].join('\n'),
    );
    writeFileSync(
      join(cwd, 'src/example.test.js'),
      `describe.only('suite', () => {});\n`,
    );

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

    expect(messages['component.jsx']).toEqual([
      'react/no-direct-mutation-state',
    ]);
    expect(messages['example.test.js']).toEqual(['jest/no-focused-tests']);
  });

  it('maps equivalent rules and enables the full recommended rule set', () => {
    const [recommended, typescript, jest] = getUtooLintConfig();

    expect(recommended.rules).toMatchObject({
      'no-global-assign': 2,
      'no-var': 2,
      'react/no-direct-mutation-state': 2,
    });
    expect(recommended.rules).not.toHaveProperty('no-native-reassign');
    expect(typescript.rules).toMatchObject({
      'no-invalid-this': 2,
      '@typescript-eslint/no-unused-vars': 2,
    });
    expect(typescript.rules).not.toHaveProperty(
      '@typescript-eslint/no-invalid-this',
    );
    expect(jest.rules).toMatchObject({
      'jest/no-conditional-expect': 2,
      'jest/no-focused-tests': 2,
      'jest/valid-expect': 2,
      'jest/valid-title': 2,
    });
    expect(Object.keys(jest.rules!)).toHaveLength(
      Object.keys(jestRules).length,
    );
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
