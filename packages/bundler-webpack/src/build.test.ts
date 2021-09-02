import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { build } from './build';
import { JSMinifier } from './types';

interface IOpts {
  files: Record<string, string>;
}

const expects: Record<string, Function> = {
  normal({ files }: IOpts) {
    expect(Object.keys(files).length).toEqual(2);
    expect(files['index.css']).toContain(`color: red;`);
    expect(files['index.js']).toContain(`console.log('index')`);
  },
};

const fixtures = join(__dirname, 'fixtures');
for (const fixture of readdirSync(fixtures)) {
  if (fixture.startsWith('.')) continue;
  const base = join(fixtures, fixture);
  if (statSync(base).isFile()) continue;

  test(`build ${fixture}`, async () => {
    await build({
      config: {
        jsMinifier: JSMinifier.none,
      },
      cwd: base,
      entry: {
        index: join(base, 'index.ts'),
      },
    });
    const fileNames = readdirSync(join(base, 'dist'));
    const files = fileNames.reduce<Record<string, string>>((memo, fileName) => {
      if (['.css', '.js'].includes(extname(fileName))) {
        memo[fileName] = readFileSync(join(base, 'dist', fileName), 'utf-8');
      } else {
        memo[fileName] = '1';
      }
      return memo;
    }, {});
    expects[fixture]({
      files,
    });
  });
}
