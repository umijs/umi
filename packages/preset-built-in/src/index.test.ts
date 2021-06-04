import { cleanup, render } from '@testing-library/react';
import { Service } from '@umijs/core';
import cheerio from '@umijs/deps/compiled/cheerio';
import { rimraf } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { EOL, platform } from 'os';
import { join } from 'path';
import { Stream } from 'stream';

const fixtures = join(__dirname, 'fixtures');

beforeEach(() => {
  if (process.env.__IS_SERVER) {
    delete process.env.__IS_SERVER;
  }
});

afterEach(cleanup);

test('api.writeTmpFile error in register stage', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin-error'))],
  });
  await expect(service.init()).rejects.toThrow(
    /api.writeTmpFile\(\) should not execute in register stage./,
  );
});

test('api.writeTmpFile', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin'))],
  });
  await service.run({
    name: 'foo',
    args: {},
  });
  const tmpFile = join(cwd, '.umi-test', 'foo');
  expect(readFileSync(tmpFile, 'utf-8')).toEqual('foo');
  rimraf.sync(tmpFile);
});

test('api.writeTmpFile with ts-nocheck', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile-ts');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin'))],
  });
  await service.run({
    name: 'foo',
    args: {},
  });
  const tmpFile = join(cwd, '.umi-test', 'foo.ts');
  expect(readFileSync(tmpFile, 'utf-8')).toEqual(`// @ts-nocheck${EOL}foo`);
  rimraf.sync(tmpFile);
});

test('api.writeTmpFile without ts-nocheck', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile-ts-check');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin'))],
  });
  await service.run({
    name: 'foo',
    args: {},
  });
  const tmpFile = join(cwd, '.umi-test', 'foo.ts');
  expect(readFileSync(tmpFile, 'utf-8')).toEqual('foo');
  rimraf.sync(tmpFile);
});

xtest('global js', async () => {
  const cwd = join(fixtures, 'global-files');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  const reactNode = require(join(cwd, 'src', '.umi-test', 'umi.ts')).default;
  const { container } = render(reactNode);
  expect(container.textContent).toEqual('hello Global');
});

test('html', async () => {
  const cwd = join(fixtures, 'html');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'html'],
    },
  });
  const removeSpace = (str: string | null) =>
    str?.replace(/[\r\n]/g, '')?.replace(/\ +/g, '');
  const html = readFileSync(join(cwd, 'dist', 'index.html'), 'utf-8');
  const $ = cheerio.load(html);
  expect($('head meta[name="keywords"]').attr('content')).toEqual('umi');
  expect($('head link[href="//a.alicdn.com/common.css"]')).toBeTruthy();
  expect($('head link[href="//a.alicdn.com/antd.css"]')).toBeTruthy();
  expect(removeSpace($('head style').eq(0).html())).toEqual(`.a{color:red;}`);
  expect(removeSpace($('head style').eq(1).html())).toEqual(`.b{color:blue;}`);
  expect($('head script[src="//g.alicdn.com/ga.js"]')).toBeTruthy();
  expect(removeSpace($('head script').eq(3).html())).toContain(
    `console.log(3)`,
  );

  expect($('body script[src="//g.alicdn.com/react.js"]')).toBeTruthy();
  expect(removeSpace($('body script').eq(1).html())).toContain(
    `console.log(1);`,
  );
  expect(removeSpace($('body script').eq(2).html())).toContain(
    `console.log(2);`,
  );
  expect($('body script[crossorigin="true"]').attr('src')).toEqual(
    '/custom.js',
  );
});

test('ssr', async () => {
  const cwd = join(fixtures, 'ssr');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  expect(existsSync(tmpServerFile)).toBeTruthy();

  const render = require(tmpServerFile).default;
  const { rootContainer, html } = await render({
    path: '/',
    mountElementId: 'root',
  });
  const expectRootContainer =
    '<div><ul><li>hello</li><li>world</li></ul></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
  rimraf.sync(join(cwd, '.umi-test'));
});

test('ssr modifyServerHTML', async () => {
  const cwd = join(fixtures, 'ssr-modifyServerHTML');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  expect(existsSync(tmpServerFile)).toBeTruthy();
  const render = require(tmpServerFile).default;
  const { rootContainer, html } = await render({
    path: '/',
    mountElementId: 'root',
  });
  const expectRootContainer =
    '<div><ul><li>hello</li><li>world</li></ul></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  expect(html).toMatch('<script>alert(123);</script>');
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
  rimraf.sync(join(cwd, '.umi-test'));
});

test('ssr beforeRenderServer', async () => {
  const cwd = join(fixtures, 'ssr-beforeRenderServer');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  expect(existsSync(tmpServerFile)).toBeTruthy();

  const render = require(tmpServerFile).default;
  const { rootContainer, html } = await render({
    path: '/',
    mountElementId: 'root',
  });
  const expectRootContainer =
    '<div><h1>/</h1><ul><li>hello</li><li>world</li></ul></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
  rimraf.sync(join(cwd, '.umi-test'));
});

test('ssr getInitialPropsCtx', async () => {
  const cwd = join(fixtures, 'ssr-getInitialPropsCtx');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  expect(existsSync(tmpServerFile)).toBeTruthy();

  const render = require(tmpServerFile).default;
  const { rootContainer, html } = await render({
    path: '/',
    mountElementId: 'root',
    getInitialPropsCtx: {
      fromServerTitle: 'Server Title',
    },
  });
  const expectRootContainer = '<div><h1>Server Title</h1></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
  rimraf.sync(join(cwd, '.umi-test'));
});

test('ssr using stream', (done) => {
  const cwd = join(fixtures, 'ssr-stream');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];
  rimraf.sync(join(cwd, '.umi-test'));

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  service
    .run({
      name: 'g',
      args: {
        _: ['g', 'tmp'],
      },
    })
    .then(() => {
      expect(existsSync(tmpServerFile)).toBeTruthy();
      const render = require(tmpServerFile).default;
      render({
        path: '/',
        mode: 'stream',
        mountElementId: 'root',
        // @ts-ignore
      }).then(({ html, rootContainer }) => {
        expect(rootContainer instanceof Stream).toBeTruthy();
        expect(html instanceof Stream).toBeTruthy();
        const expectBytes = Buffer.from(
          '<div><ul><li>hello</li><li>world</li></ul></div>',
        );
        let bytes = Buffer.from('');
        rootContainer.on('data', (chunk: any) => {
          bytes = Buffer.concat([bytes, chunk]);
        });
        rootContainer.on('end', () => {
          expect(bytes).toEqual(expectBytes);
          done();
        });
      });
    });
});

test('ssr htmlTemplate', async () => {
  // @ts-ignore
  process.env.__IS_SERVER = true;
  const cwd = join(fixtures, 'ssr-htmlTemplate');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  expect(existsSync(tmpServerFile)).toBeTruthy();

  const render = require(tmpServerFile).default;
  const { rootContainer, html } = await render({
    path: '/',
    mountElementId: 'root',
    getInitialPropsCtx: {
      fromServerTitle: 'Server Title',
    },
    htmlTemplate: `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />
        <link rel="stylesheet" href="/umi.css" />
        <script>console.log(1);</script>
        <script>
          window.routerBase = "/";
        </script>
        <script>
          //! umi version: undefined
        </script>
      </head>
      <body>
        <div id="root"></div>

        <script src="/umi.js"></script>
      </body>
    </html>`,
  });
  const expectRootContainer = '<div><h1>Server Title</h1></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  expect(html).toMatch('<script>console.log(1);</script>');
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
  rimraf.sync(join(cwd, '.umi-test'));
});

xtest('ssr dynamicImport', async () => {
  // @ts-ignore
  process.env.__IS_SERVER = true;
  const cwd = join(fixtures, 'ssr-dynamicImport');
  const corePath = join(cwd, '.umi-test', 'core');
  const tmpServerFile = join(corePath, 'server.ts');
  delete require.cache[tmpServerFile];

  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  expect(existsSync(tmpServerFile)).toBeTruthy();
  const manifest = {
    'p__index.css': '/p__index.chunk.css',
    'p__Bar.css': '/p__Bar.chunk.css',
  };

  // without webpack, so export default
  const render = require(tmpServerFile).default;
  // render /
  const homeResult = await render({
    path: '/',
    mountElementId: 'root',
    manifest,
  });
  const expectRootContainer =
    '<div><ul><li>hello</li><li>world</li></ul></div>';
  expect(homeResult.rootContainer).toEqual(expectRootContainer);
  expect(homeResult.html).toMatch('<script src="/umi.js"></script>');
  expect(homeResult.html).toMatch(
    '<link rel="stylesheet" href="/p__index.chunk.css" />',
  );

  // render /bar
  const BarResult = await render({
    path: '/bar',
    mountElementId: 'root',
    manifest,
  });
  expect(BarResult.rootContainer).toEqual('<h2>Bar</h2>');

  expect(BarResult.html).toMatch('<script src="/umi.js"></script>');
  expect(BarResult.html).toMatch(
    '<link rel="stylesheet" href="/p__Bar.chunk.css" />',
  );
  rimraf.sync(join(cwd, '.umi-test'));
});

test('exportStatic', async () => {
  const cwd = join(fixtures, 'exportStatic');
  const service = new Service({
    cwd,
    presets: [require.resolve('../lib/index.js')],
  });
  await service.run({
    name: 'build',
    args: {},
  });
  expect(existsSync(join(cwd, 'dist', 'index.html'))).toBeTruthy();
  if (platform() === 'win32') {
    expect(existsSync(join(cwd, 'dist', 'list', '.id.html'))).toBeTruthy();
  } else {
    expect(existsSync(join(cwd, 'dist', 'list', ':id.html'))).toBeTruthy();
  }
});
