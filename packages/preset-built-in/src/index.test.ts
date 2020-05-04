import { Service } from '@umijs/core';
import { Stream } from 'stream';
import { join } from 'path';
import cheerio from 'cheerio';
import { render, cleanup } from '@testing-library/react';
import { rimraf } from '@umijs/utils';
import { readFileSync, existsSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

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

test('global js', async () => {
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

const htmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
    />
    <link rel="stylesheet" href="/umi.css" />
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
</html>`;

test('ssr', async () => {
  const cwd = join(fixtures, 'ssr');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];
  rimraf.sync(join(cwd, '.umi-test'));

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
    htmlTemplate,
    mountElementId: 'root',
  });
  const expectRootContainer =
    '<div><ul><li>hello</li><li>world</li></ul></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
});

test('ssr getInitialPropsParams', async () => {
  const cwd = join(fixtures, 'ssr');
  const tmpServerFile = join(cwd, '.umi-test', 'core', 'server.ts');

  delete require.cache[tmpServerFile];
  rimraf.sync(join(cwd, '.umi-test'));

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
    path: '/getInitialPropsParams',
    htmlTemplate,
    mountElementId: 'root',
    getInitialPropsParams: {
      fromServerTitle: 'Server Title',
    },
  });
  const expectRootContainer = '<div><h1>Server Title</h1></div>';
  expect(rootContainer).toEqual(expectRootContainer);
  const $ = cheerio.load(html);
  expect($('#root').html()).toEqual(expectRootContainer);
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
        htmlTemplate,
        mode: 'stream',
        mountElementId: 'root',
      }).then(({ html, rootContainer }) => {
        expect(rootContainer instanceof Stream).toBeTruthy();
        expect(html instanceof Stream).toBeTruthy();
        const expectBytes = new Buffer(
          '<div><ul><li>hello</li><li>world</li></ul></div>',
        );
        let bytes = new Buffer('');
        rootContainer.on('data', (chunk) => {
          bytes = Buffer.concat([bytes, chunk]);
        });
        rootContainer.on('end', () => {
          expect(bytes).toEqual(expectBytes);
          done();
        });
      });
    });
});
