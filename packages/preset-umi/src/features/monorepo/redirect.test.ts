import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import ts from 'typescript';
import redirect from './redirect';

test('resolves workspace package and subpath types from the same source as the bundler', async () => {
  const root = mkdtempSync(join(tmpdir(), 'umi-workspace-types-'));
  try {
    const cwd = join(root, 'app');
    const ui = join(root, 'ui');
    const src = join(ui, 'lib');
    const pkg = {
      name: 'app',
      version: '1.0.0',
      dependencies: { '@shop/ui': '1.0.0' },
    };
    mkdirSync(cwd);
    mkdirSync(src, { recursive: true });
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
        types: 'dist/index.d.ts',
      }),
    );
    for (const file of ['index.ts', 'button.ts'])
      writeFileSync(join(src, file), 'export const label = "test";');
    const api = {
      cwd,
      pkg,
      config: { monorepoRedirect: { srcDir: ['lib'] }, alias: {} },
      describe: jest.fn(),
      EnableBy: { config: 'config' },
      modifyConfig: jest.fn(),
      modifyTSConfig: jest.fn(),
    };
    redirect(api as any);
    api.config = await api.modifyConfig.mock.calls[0][0](api.config);
    expect(api.config.alias).toMatchObject({ '@shop/ui': src });
    const tsconfig = { compilerOptions: { paths: { '@/*': ['./src/*'] } } };
    const result = api.modifyTSConfig.mock.calls.reduce(
      (memo, [fn]) => fn(memo),
      tsconfig,
    );
    for (const [specifier, file] of [
      ['@shop/ui', 'index.ts'],
      ['@shop/ui/button', 'button.ts'],
    ]) {
      const { resolvedModule } = ts.resolveModuleName(
        specifier,
        join(cwd, 'page.ts'),
        {
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          paths: result.compilerOptions.paths,
        },
        ts.sys,
      );
      expect(resolvedModule?.resolvedFileName).toBe(
        join(src, file).replace(/\\/g, '/'),
      );
    }
    expect(result.compilerOptions.paths['@/*']).toEqual(['./src/*']);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
