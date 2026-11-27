import { webpack } from '@umijs/bundler-webpack/compiled/webpack';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import codeSplitting from './codeSplitting';

test('keeps independent groups of unnamed lazy imports in separate shared chunks', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'umi-shared-chunks-'));
  const out = join(dir, 'dist');
  try {
    const pages = ['orders', 'invoices', 'catalog', 'inventory'];
    writeFileSync(
      join(dir, 'index.js'),
      pages.map((page) => `import('./${page}');`).join('\n'),
    );
    for (const [index, page] of pages.entries()) {
      const group = index < 2 ? 'billing' : 'products';
      writeFileSync(
        join(dir, page + '.js'),
        `console.log('${page}', require('./${group}'));`,
      );
    }
    for (const group of ['billing', 'products']) {
      writeFileSync(
        join(dir, group + '.js'),
        `module.exports = '${group}_payload_${'x'.repeat(35000)}';`,
      );
    }

    const splitChunks = jest.fn();
    codeSplitting({
      describe: jest.fn(),
      EnableBy: { config: 'config' },
      env: 'production',
      config: { codeSplitting: { jsStrategy: 'granularChunks' } },
      chainWebpack(fn: Function) {
        fn({ optimization: { splitChunks } });
      },
    } as any);
    const compiler = webpack({
      mode: 'production',
      context: dir,
      entry: './index.js',
      output: { path: out },
      optimization: {
        minimize: false,
        splitChunks: splitChunks.mock.calls[0][0],
      },
    });
    try {
      await new Promise<void>((resolve, reject) =>
        compiler.run((err, stats) => {
          if (err || stats?.hasErrors())
            reject(err || new Error(stats?.toString('errors-only')));
          else resolve();
        }),
      );
    } finally {
      await new Promise<void>((resolve, reject) =>
        compiler.close((err) => (err ? reject(err) : resolve())),
      );
    }
    const files = readdirSync(out);
    const containing = (marker: string) =>
      files.filter((file) =>
        readFileSync(join(out, file), 'utf8').includes(marker),
      );
    const billing = containing('billing_payload_');
    const products = containing('products_payload_');
    expect(billing).toHaveLength(1);
    expect(products).toHaveLength(1);
    expect(billing[0]).not.toBe(products[0]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
