import { spawnSync } from 'child_process';
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import redirect from './redirect';

test.each([
  {
    scenario: 'app rootDir with a TypeScript workspace dependency',
    redirectConfig: true,
    rootDir: '.',
    entry: 'index.ts',
    consumer: "import { label } from '@shop/ui'; export const text = label;",
  },
  {
    scenario: 'handwritten types for a JavaScript workspace dependency',
    redirectConfig: { srcDir: ['src'] },
    rootDir: '.',
    entry: 'index.js',
    consumer:
      "import type { Options } from '@shop/ui'; export const options: Options = {label: 'ok'};",
  },
  {
    scenario:
      'opt-in source types and subpaths ahead of the published declarations',
    redirectConfig: { srcDir: ['src'], sourceTypes: true },
    rootDir: '..',
    entry: 'index.ts',
    consumer:
      "import { newLabel } from '@shop/ui'; import { button } from '@shop/ui/button'; export const text = newLabel + button;",
  },
])(
  'type-checks $scenario',
  async ({ redirectConfig, rootDir, entry, consumer }) => {
    const root = realpathSync(
      mkdtempSync(join(tmpdir(), 'umi-workspace-types-')),
    );
    try {
      const cwd = join(root, 'app');
      const ui = join(root, 'ui');
      const src = join(ui, 'src');
      const scope = join(root, 'node_modules', '@shop');
      const pkg = {
        name: 'app',
        version: '1.0.0',
        dependencies: { '@shop/ui': '1.0.0' },
      };
      mkdirSync(cwd);
      mkdirSync(src, { recursive: true });
      mkdirSync(scope, { recursive: true });
      symlinkSync(ui, join(scope, 'ui'), 'junction');
      writeFileSync(
        join(root, 'package.json'),
        JSON.stringify({ private: true, workspaces: ['app', 'ui'] }),
      );
      writeFileSync(join(root, 'yarn.lock'), '# yarn lockfile v1\n');
      writeFileSync(join(cwd, 'package.json'), JSON.stringify(pkg));
      writeFileSync(
        join(ui, 'package.json'),
        JSON.stringify({
          name: '@shop/ui',
          version: '1.0.0',
          types: 'types.d.ts',
        }),
      );
      writeFileSync(
        join(ui, 'types.d.ts'),
        'export declare const label: string; export interface Options {label:string}',
      );
      writeFileSync(
        join(src, entry),
        "export const label = 'label'; export const newLabel = 'new';",
      );
      writeFileSync(join(src, 'button.ts'), "export const button = 'button';");
      writeFileSync(join(cwd, 'page.ts'), consumer);
      const api = {
        cwd,
        pkg,
        config: { monorepoRedirect: redirectConfig, alias: {} },
        describe: jest.fn(),
        EnableBy: { config: 'config' },
        modifyConfig: jest.fn(),
        modifyTSConfig: jest.fn(),
      };
      redirect(api as any);
      api.config = await api.modifyConfig.mock.calls[0][0](api.config);
      expect(api.config.alias).toMatchObject({ '@shop/ui': src });
      const config = api.modifyTSConfig.mock.calls[0][0]({
        files: ['page.ts'],
        compilerOptions: {
          rootDir,
          module: 'esnext',
          moduleResolution: 'bundler',
          strict: true,
          allowJs: true,
          types: [],
          paths: { '@/*': ['./src/*'] },
        },
      });
      expect(config.compilerOptions.paths['@/*']).toEqual(['./src/*']);
      writeFileSync(join(cwd, 'tsconfig.json'), JSON.stringify(config));
      const result = spawnSync(
        process.execPath,
        [
          require.resolve('typescript/bin/tsc'),
          '--noEmit',
          '--pretty',
          'false',
        ],
        { cwd, encoding: 'utf8' },
      );
      expect(result.stdout + result.stderr).toBe('');
      expect(result.status).toBe(0);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  },
);
