import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { join } from 'path';
import { runInNewContext } from 'vm';
import webpack from '../compiled/webpack';

test('applies hot updates using the prebundled Webpack runtime', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-webpack-hmr-'));
  const outputPath = join(cwd, 'dist');
  writeFileSync(
    join(cwd, 'index.js'),
    `exports.value = () => require('./value');
     exports.update = () => module.hot.check(true);`,
  );
  const writeValue = (value: number) =>
    writeFileSync(
      join(cwd, 'value.js'),
      `module.exports = ${value}; module.hot.accept();`,
    );
  writeValue(1);
  const compiler = webpack({
    mode: 'development',
    context: cwd,
    recordsPath: join(cwd, 'records.json'),
    target: 'node',
    devtool: false,
    cache: false,
    entry: './index.js',
    output: {
      path: outputPath,
      filename: 'main.js',
      library: { type: 'commonjs2' },
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  });
  const compile = () =>
    new Promise<void>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) return reject(error);
        if (stats!.hasErrors()) return reject(new Error(stats!.toString()));
        resolve();
      });
    });
  try {
    await compile();
    const filename = join(outputPath, 'main.js');
    const module = { exports: {} as any };
    runInNewContext(readFileSync(filename, 'utf8'), {
      module,
      exports: module.exports,
      require: createRequire(filename),
      __dirname: outputPath,
      console,
    });
    expect(module.exports.value()).toBe(1);
    writeValue(2);
    compiler.inputFileSystem!.purge!();
    await compile();
    await expect(module.exports.update()).resolves.toEqual([
      expect.stringMatching(/value\.js$/),
    ]);
    expect(module.exports.value()).toBe(2);
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close((error) => (error ? reject(error) : resolve()));
    });
    rmSync(cwd, { recursive: true, force: true });
  }
});
