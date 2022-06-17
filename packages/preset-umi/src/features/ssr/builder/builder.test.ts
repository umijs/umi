import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { join } from 'path';
import { assetsLoader } from './assets-loader';
import { loader } from './builder';
import { cssLoader } from './css-loader';
import { lessLoader } from './less-loader';

const fixtures = join(__dirname, '../../../../fixtures/ssr-builder');

async function build(opts: { cwd: string }) {
  await esbuild.build({
    format: 'cjs',
    platform: 'node',
    target: 'esnext',
    bundle: true,
    entryPoints: [join(opts.cwd, 'index.ts')],
    outdir: join(opts.cwd, 'dist'),
    loader,
    plugins: [
      cssLoader({ cwd: opts.cwd }),
      lessLoader({ cwd: opts.cwd }),
      assetsLoader({ cwd: opts.cwd }),
    ],
  });
}

test('css-loader', async () => {
  const cwd = join(fixtures, 'css-loader');
  await build({ cwd });
  expect(readFileSync(join(cwd, 'dist/index.js'), 'utf-8')).toContain(
    `{ "foo": "foo___Bmb28", "hoo": "hoo___Bob28" };`,
  );
});

test('less-loader', async () => {
  const cwd = join(fixtures, 'less-loader');
  await build({ cwd });
  const code = readFileSync(join(cwd, 'dist/index.js'), 'utf-8');
  expect(code).toContain(
    `{ "a": "a___3NAYQ", "b": "b___3NAYg", "foo": "foo___AZm9v", "hoo": "hoo___AaG9v" };`,
  );
  expect(code).toContain(`{ "bar": "bar___GJhcg", "hoo": "hoo___Ghvbw" };`);
});

test('assets-loader', async () => {
  const cwd = join(fixtures, 'assets-loader');
  await build({ cwd });
  const code = readFileSync(join(cwd, 'dist/index.js'), 'utf-8');
  expect(code).toContain(`var foo_default = g_getAssets("assets/foo.png")`);
  expect(code).toContain(`var umi_default = "data:image/png;base64,`);
});
