import { build } from '@umijs/bundler-utils/compiled/esbuild';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runInNewContext } from 'vm';
import webpack from 'webpack';
import { Dep } from './dep';

const cwd = join(__dirname, '../../fixtures/resolvesContexts/browser-ignored');
const ignoredDependencies = ['browser-ignored', 'browser-ignored/server.js'];

function createDep(file: string) {
  return new Dep({ file, cwd, version: '1.0.0', excludeNodeNatives: false });
}

function evaluate(content: string) {
  const module = { exports: {} as any };
  runInNewContext(content, { module, exports: module.exports });
  return module.exports;
}

test.each(ignoredDependencies)(
  'exposes an empty module for %s',
  async (file) => {
    const dep = createDep(file);
    expect(await dep.getRealFile()).toBe(false);
    expect(evaluate(await dep.buildExposeContent())).toEqual({});
  },
);

test.each(['webpack', 'esbuild'])(
  'bundles ignored dependencies with %s',
  async (bundler) => {
    const outputPath = mkdtempSync(join(tmpdir(), 'mfsu-browser-ignored-'));
    try {
      for (const [index, file] of ignoredDependencies.entries()) {
        writeFileSync(
          join(outputPath, `dep-${index}.js`),
          await createDep(file).buildExposeContent(),
        );
      }
      const entry = join(outputPath, 'entry.js');
      writeFileSync(
        entry,
        `import root from './dep-0.js';
import subpath from './dep-1.js';
export { root, subpath };`,
      );

      let content: string;
      if (bundler === 'esbuild') {
        const result = await build({
          entryPoints: [entry],
          bundle: true,
          write: false,
          platform: 'browser',
          format: 'cjs',
        });
        content = result.outputFiles![0].text;
      } else {
        const compiler = webpack({
          mode: 'development',
          target: 'web',
          devtool: false,
          entry,
          output: {
            path: outputPath,
            filename: 'bundle.js',
            library: { type: 'commonjs2' },
          },
        });
        try {
          await new Promise<void>((resolve, reject) => {
            compiler.run((error, stats) => {
              if (error) return reject(error);
              if (stats!.hasErrors())
                return reject(new Error(stats!.toString()));
              resolve();
            });
          });
          content = readFileSync(join(outputPath, 'bundle.js'), 'utf8');
        } finally {
          await new Promise<void>((resolve, reject) => {
            compiler.close((error) => (error ? reject(error) : resolve()));
          });
        }
      }

      const exports = evaluate(content);
      expect(exports.root).toEqual({});
      expect(exports.subpath).toEqual({});
      expect(content).not.toContain('NODE_ONLY');
    } finally {
      rmSync(outputPath, { recursive: true, force: true });
    }
  },
);

test('still rejects dependencies that cannot be resolved', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await expect(
      createDep('not-installed').buildExposeContent(),
    ).rejects.toThrow('dependence not found: not-installed');
  } finally {
    log.mockRestore();
  }
});
