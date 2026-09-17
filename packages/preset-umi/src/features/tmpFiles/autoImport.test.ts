import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getAutoImportDts } from './getAutoImportDts';

const script = String.raw`
const ts = require(process.argv[1]);
const root = process.argv[2];
const file = require('path').join(root, 'index.tsx');
const typeCheckFile = require('path').join(root, 'type-check.ts');
const source = require('fs').readFileSync(file, 'utf8');

const logger = {
  close() {},
  hasLevel() { return false; },
  loggingEnabled() { return false; },
  perftrc() {},
  info() {},
  startGroup() {},
  endGroup() {},
  msg() {},
  getLogFileName() {},
};
const host = {
  ...ts.sys,
  setTimeout,
  clearTimeout,
  setImmediate,
  clearImmediate,
  getExecutingFilePath: () => process.argv[1],
};
const projectService = new ts.server.ProjectService({
  host,
  logger,
  cancellationToken: ts.server.nullCancellationToken,
  useSingleInferredProject: false,
  useInferredProjectPerProjectRoot: true,
  typingsInstaller: ts.server.nullTypingsInstaller,
  throttleWaitMilliseconds: 0,
  suppressDiagnosticEvents: true,
  serverMode: ts.LanguageServiceMode.Semantic,
});

projectService.setHostConfiguration({
  preferences: {
    includePackageJsonAutoImports: 'auto',
    includeCompletionsForModuleExports: true,
  },
});
projectService.openClientFile(file, source, undefined, root);
const project = projectService.ensureDefaultProjectForFile(file);
const languageService = project.getLanguageService();
const result = {};

for (const name of ['useModel', 'useIntl']) {
  const position = source.indexOf(name) + name.length;
  const completions = languageService.getCompletionsAtPosition(file, position, {
    includeExternalModuleExports: true,
    includeInsertTextCompletions: true,
  });
  result[name] = (completions?.entries || [])
    .filter((entry) => entry.name === name)
    .map((entry) => entry.source);
}

result.diagnostics = require('fs').existsSync(typeCheckFile)
  ? languageService
      .getSemanticDiagnostics(typeCheckFile)
      .map((diagnostic) => diagnostic.code)
  : [];

const config = ts.readConfigFile(
  require('path').join(root, 'tsconfig.json'),
  ts.sys.readFile,
);
const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(
  parsedConfig.fileNames.filter((fileName) => fileName !== file),
  parsedConfig.options,
);
result.projectDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .map((diagnostic) => diagnostic.code);

process.stdout.write(JSON.stringify(result));
process.exit(0);
`;

function createFixture(seedPublicEntry: boolean) {
  const importSource = 'umi';
  const root = mkdtempSync(join(tmpdir(), 'umi-auto-import-'));

  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({
      dependencies: Object.fromEntries([
        ...Array.from({ length: 20 }, (_, index) => [
          `fixture-${index}`,
          '1.0.0',
        ]),
        [importSource, '1.0.0'],
      ]),
    }),
  );
  for (let index = 0; index < 20; index++) {
    const packageDir = join(root, 'node_modules', `fixture-${index}`);
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(
      join(packageDir, 'package.json'),
      JSON.stringify({
        name: `fixture-${index}`,
        version: '1.0.0',
        types: 'index.d.ts',
      }),
    );
    writeFileSync(
      join(packageDir, 'index.d.ts'),
      `export declare const fixture${index}: string;`,
    );
  }
  const umiDir = join(root, 'node_modules', 'umi');
  mkdirSync(umiDir, { recursive: true });
  writeFileSync(
    join(umiDir, 'package.json'),
    JSON.stringify({ name: 'umi', version: '1.0.0', types: 'index.d.ts' }),
  );
  writeFileSync(
    join(umiDir, 'index.d.ts'),
    `export * from '@@/exports';\nexport declare function defineConfig(config: object): object;\nexport interface IApi { cwd: string; }`,
  );
  writeFileSync(
    join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        moduleResolution: 'bundler',
        module: 'esnext',
        paths: {
          [importSource]: ['./node_modules/umi'],
          '@@/*': ['./*'],
        },
      },
      include: ['./**/*.d.ts', './**/*.ts', './**/*.tsx'],
    }),
  );
  if (seedPublicEntry) {
    const autoImportDts = getAutoImportDts(importSource);
    if (!autoImportDts) throw new Error('Expected auto-import declarations.');
    writeFileSync(join(root, 'auto-import.d.ts'), autoImportDts);
  }
  writeFileSync(
    join(root, 'exports.ts'),
    [
      `export { useModel } from './plugin-model';`,
      `export { useIntl } from './plugin-locale';`,
    ].join('\n'),
  );
  writeFileSync(join(root, 'plugin-model.ts'), `export function useModel() {}`);
  writeFileSync(join(root, 'plugin-locale.ts'), `export function useIntl() {}`);
  writeFileSync(join(root, 'index.tsx'), `useModel;\nuseIntl;\n`);
  if (seedPublicEntry) {
    writeFileSync(
      join(root, 'type-check.ts'),
      `import { defineConfig, type IApi, useIntl, useModel } from '${importSource}';\ndefineConfig({});\ndeclare const api: IApi;\nvoid api;\nvoid useIntl;\nvoid useModel;\n`,
    );
  }

  return root;
}

test('discovers generated runtime hooks from the public Umi import source', () => {
  const root = createFixture(true);
  try {
    const result = JSON.parse(
      execFileSync(
        process.execPath,
        ['-e', script, require.resolve('typescript'), root],
        { encoding: 'utf8' },
      ),
    );
    expect(result.useModel).toContain('umi');
    expect(result.useIntl).toContain('umi');
    expect(result.diagnostics).toEqual([]);
    expect(result.projectDiagnostics).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reproduces the missing public suggestion without the generated seed import', () => {
  const root = createFixture(false);
  try {
    const result = JSON.parse(
      execFileSync(
        process.execPath,
        ['-e', script, require.resolve('typescript'), root],
        { encoding: 'utf8' },
      ),
    );
    expect(result.useModel).not.toContain('umi');
    expect(result.useIntl).not.toContain('umi');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('does not generate a seed import for custom import sources', () => {
  expect(getAutoImportDts('@umijs/max')).toBeNull();
});
