import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { build } from './build';
import { CSSMinifier, JSMinifier } from './types';

interface IOpts {
  files: Record<string, string>;
}

const EXISTS = '1';

const expects: Record<string, Function> = {
  alias({ files }: IOpts) {
    expect(files['index.js']).toContain(`var a = 'react';`);
  },
  'asset-avif'({ files }: IOpts) {
    expect(files['index.js']).toContain(`.avif"`);
  },
  'asset-base64'({ files }: IOpts) {
    expect(files['index.css']).toContain(`data:image/svg+xml;base64,P`);
  },
  'asset-fallback'({ files }: IOpts) {
    expect(files['index.js']).toContain(`.mp3"`);
  },
  'asset-image-large'({ files }: IOpts) {
    expect(files['index.js']).toContain(`.png"`);
  },
  'asset-image-small'({ files }: IOpts) {
    expect(files['index.js']).toContain(`"data:image/png;base64,`);
  },
  chainWebpack({ files }: IOpts) {
    expect(files['index.js']).toContain(`var a = 'react';`);
  },
  copy({ files }: IOpts) {
    expect(files['a.js']).toContain(`console.log('copy');`);
  },
  'copy-from-assets'({ files }: IOpts) {
    expect(files['assets']).toContain(EXISTS);
  },
  'css-modules'({ files }: IOpts) {
    expect(files['index.js']).toContain(`var a_module = ({"a":"`);
  },
  'css-modules-auto'({ files }: IOpts) {
    expect(files['index.js']).toContain(`var amodules = ({"a":"`);
  },
  'css-side-effects'({ files }: IOpts) {
    expect(files['index.css']).toContain(`color: red;`);
  },
  define({ files }: IOpts) {
    expect(files['index.js']).toContain(`console.log("1");`);
    expect(files['index.js']).toContain(`console.log("2");`);
    expect(files['index.js']).toContain(`console.log("3");`);
    expect(files['index.js']).toContain(`console.log("test");`);
  },
  externals({ files }: IOpts) {
    expect(files['index.js']).toContain(
      `var external_React_namespaceObject = React;`,
    );
  },
  json({ files }: IOpts) {
    expect(files['index.js']).toContain(
      `var react_namespaceObject = {"foo":"react"};`,
    );
  },
  mdx({ files }: IOpts) {
    expect(files['index.js']).toContain(`# foo`);
  },
  'node-polyfill'({ files }: IOpts) {
    expect(files['index.js']).toContain(`exports.join = function() {`);
    expect(files['index.js']).toContain(`__webpack_require__.g.foo`);
  },
  'node-prefix'({ files }: IOpts) {
    expect(files['index.js']).toContain(`exports.join = function() {`);
    expect(files['index.js']).toContain(`__webpack_require__.g.foo`);
  },
  'postcss-autoprefixer'({ files }: IOpts) {
    expect(files['index.css']).toContain(
      `.a { display: -ms-flexbox; display: flex; }`,
    );
  },
  'postcss-extra-postcss-plugins'({ files }: IOpts) {
    expect(files['index.css']).toContain(`-webkit-overflow-scrolling: touch;`);
  },
  'postcss-flexbugs-fixes'({ files }: IOpts) {
    expect(files['index.css']).toContain(`.foo { flex: 1 1; }`);
  },
  svgo({ files }: IOpts) {
    expect(files['static']).toContain(EXISTS);
    expect(files['index.js']).toContain(`.svg`);
  },
  'svgo-false'({ files }: IOpts) {
    expect(files['static']).toContain(EXISTS);
    expect(files['index.js']).toContain(`.svg`);
  },
  svgr({ files }: IOpts) {
    expect(files['static']).toContain(EXISTS);
    expect(files['index.js']).toContain(`.svg`);
  },
  targets({ files }: IOpts) {
    expect(files['index.js']).toContain(`var foo = 'foo';`);
  },
  swc({ files }: IOpts) {
    expect(files['index.js']).toContain(`const a = 'react';`);
    expect(files['index.js']).toContain(`const myIdentity = identity;`);
  },
  theme({ files }: IOpts) {
    expect(files['index.css']).toContain(`color: green;`);
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
        jsMinifier: JSMinifier.none,
        cssMinifier: CSSMinifier.none,
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
