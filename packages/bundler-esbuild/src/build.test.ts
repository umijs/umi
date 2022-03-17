import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { build } from './build';

interface IOpts {
  files: Record<string, string>;
}

const EXISTS = '1';

const expects: Record<string, Function> = {
  alias({ files }: IOpts) {
    // import('foo') > import ('/path/foo.js')
    expect(files['index.js']).toContain(`console.log("foo");`);
    // import('dir') > import ('/path/dir/index.js')
    expect(files['index.js']).toContain(`console.log("dir");`);
    // import('dir/bar') > import ('/path/dir/bar.js')
    expect(files['index.js']).toContain(`console.log("bar");`);
    // import('postcss') > import ('/path/postcss.ts')
    expect(files['index.js']).toContain(`console.log("postcss");`);
    // import('postcss/lib/symbols') > import ('postcss/lib/symbols.js') 没匹配上走默认
    expect(files['index.js']).toContain(`"isClean"`);
  },
  externals({ files }: IOpts) {
    expect(files['index.js']).toContain(`module.export = React;`);
  },
  extraPostCSSPlugins({ files }: IOpts) {
    expect(files['index.js']).toContain(`console.log("foooooo");`);
    expect(files['index.css']).toContain(`font-size: 0.14rem;`);
    expect(files['index.css']).toContain(`font-size: 0.16rem;`);
    expect(files['index.css']).toContain(`font-size: 0.26rem;`);
    expect(files['index.css']).toContain(`font-size: 0.3rem;`);
  },
  less({ files }: IOpts) {
    expect(files['index.js']).toContain(`console.log("foooooo");`);
    expect(files['index.css']).toContain(`color: red;`);
    expect(files['index.css']).toContain(`color: blue;`);
    expect(files['index.css']).toContain(`color: black;`);
  },
  node_globals_polyfill({ files }: IOpts) {
    expect(files['index.js']).toContain(`console.log("__dirname", "foooooo");`);
  },
  svg({ files }: IOpts) {
    expect(files['index.js']).toContain(`console.log("foo");`);
    expect(files['index.js']).toContain(`var smile_default =`);
    expect(files['index.css']).toContain(`data:image/svg+xml;`);
  },
};

const fixtures = join(__dirname, 'fixtures');
for (const fixture of readdirSync(fixtures)) {
  if (fixture.startsWith('.')) continue;
  const base = join(fixtures, fixture);
  if (statSync(base).isFile()) continue;
  if (fixture.startsWith('x-')) continue;

  test(`build ${fixture}`, async () => {
    let config: Record<string, any> = {};
    try {
      config = require(join(base, 'config.ts')).default;
    } catch (e) {}

    await build({
      clean: true,
      config: {
        ...config,
      },
      cwd: base,
      entry: {
        index: join(base, 'index.ts'),
      },
    });
    const fileNames = readdirSync(join(base, 'dist'));
    const files = fileNames.reduce<Record<string, string>>((memo, fileName) => {
      if (['.css', '.js', '.svg'].includes(extname(fileName))) {
        memo[fileName] = readFileSync(join(base, 'dist', fileName), 'utf-8');
      } else {
        memo[fileName] = EXISTS;
      }
      return memo;
    }, {});
    expects[fixture]({
      files,
    });
  });
}
