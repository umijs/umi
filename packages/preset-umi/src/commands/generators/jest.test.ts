import { prompts } from '@umijs/utils';
import { spawnSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import generator from './jest';
import { GeneratorHelper } from './utils';

let cwd: string;
beforeEach(() => {
  // Keep the fixture within the workspace so it can use the installed Jest and Umi.
  cwd = mkdtempSync(join(__dirname, '.jest-app-'));
  jest
    .spyOn(GeneratorHelper.prototype, 'installDeps')
    .mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  rmSync(cwd, { recursive: true, force: true });
});

async function generate(useTestingLibrary: boolean) {
  const api = {
    cwd,
    pkg: { name: 'jest-app', private: true },
    pkgPath: join(cwd, 'package.json'),
    paths: { cwd, absSrcPath: cwd },
    appData: { umi: { importSource: 'umi' } },
    describe: jest.fn(),
    registerGenerator: jest.fn(),
  };
  generator(api as any);
  prompts.inject([useTestingLibrary]);
  const { checkEnable, fn } = api.registerGenerator.mock.calls[0][0];
  expect(checkEnable()).toBe(true);
  await fn();
  expect(existsSync(join(cwd, 'jest.config.cjs'))).toBe(true);
  expect(checkEnable()).toBe(false);
  return JSON.parse(readFileSync(api.pkgPath, 'utf8'));
}

test.each([false, true])(
  'installs the browser test environment (testing library: %s)',
  async (useTestingLibrary) => {
    const pkg = await generate(useTestingLibrary);
    expect(pkg.scripts.test).toBe('jest --passWithNoTests');
    expect(pkg.devDependencies['jest-environment-jsdom']).toBe(
      pkg.devDependencies.jest,
    );
  },
);

test.each([
  { moduleResolution: 'bundler' },
  { moduleResolution: 'node', verbatimModuleSyntax: true },
])('starts Jest with application compiler options %j', async (options) => {
  await generate(false);
  writeFileSync(
    join(cwd, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { module: 'ESNext', ...options } }),
  );
  mkdirSync(join(cwd, 'pages'));
  writeFileSync(join(cwd, 'pages/index.tsx'), 'export default () => null;');
  writeFileSync(
    join(cwd, 'browser.test.ts'),
    "test('browser', () => { const el: HTMLElement = document.createElement('p'); expect(el.tagName).toBe('P'); });",
  );
  const result = spawnSync(
    process.execPath,
    [
      require.resolve('jest/bin/jest'),
      '--runInBand',
      '--runTestsByPath',
      'browser.test.ts',
    ],
    { cwd, encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
});
