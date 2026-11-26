import { prompts } from '@umijs/utils';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import generator from './jest';
import { GeneratorHelper } from './utils';

test.each([false, true])(
  'generates a runnable browser test setup (testing library: %s)',
  async (useTestingLibrary) => {
    const cwd = mkdtempSync(join(tmpdir(), 'umi-jest-generator-'));
    const install = jest
      .spyOn(GeneratorHelper.prototype, 'installDeps')
      .mockImplementation(() => {});
    try {
      const api = {
        cwd,
        pkg: {},
        pkgPath: join(cwd, 'package.json'),
        paths: { cwd, absSrcPath: cwd },
        appData: { umi: { importSource: 'umi' } },
        describe: jest.fn(),
        registerGenerator: jest.fn(),
      };
      generator(api as any);
      prompts.inject([useTestingLibrary]);
      await api.registerGenerator.mock.calls[0][0].fn();
      const pkg = JSON.parse(readFileSync(api.pkgPath, 'utf8'));
      expect(pkg.scripts.test).toBe('jest --passWithNoTests');
      expect(pkg.devDependencies['jest-environment-jsdom']).toBe(
        pkg.devDependencies.jest,
      );
    } finally {
      install.mockRestore();
      rmSync(cwd, { recursive: true, force: true });
    }
  },
);
