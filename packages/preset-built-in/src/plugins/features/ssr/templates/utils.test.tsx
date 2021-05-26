import type { MergedStream } from '@umijs/deps/compiled/merge-stream';
import React from 'react';
import { renderToStaticNodeStream } from 'react-dom/server';
import { Stream } from 'stream';
import { handleHTML, ReadableString } from './utils';

const defaultHTML = `<!DOCTYPE html>
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
</html>
`;

test('handleHTML empty without html', async () => {
  const html = await handleHTML();
  expect(html).toContain('');
});

test('handleHTML normal', async () => {
  const html = await handleHTML({
    pageInitialProps: {
      username: 'ycjcl868',
    },
    rootContainer: '<h1>ycjcl868</h1>',
    html: defaultHTML,
    mountElementId: 'root',
  });
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toMatch('window.g_initialProps = {"username":"ycjcl868"};');
  expect(html).toMatch('<div id="root"><h1>ycjcl868</h1></div>');
  expect(html).toContain('</html>');
});

test('handleHTML with $', async () => {
  const html = await handleHTML({
    pageInitialProps: {
      username: '`$`',
    },
    rootContainer: '<h1>`$`</h1>',
    html: defaultHTML,
    mountElementId: 'root',
  });
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toMatch('window.g_initialProps = {"username":"`$`"};');
  expect(html).toMatch('<div id="root"><h1>`$`</h1></div>');
  expect(html).toContain('</html>');
});

test('handleHTML with content $', async () => {
  const html = await handleHTML({
    pageInitialProps: {
      username: '$',
    },
    rootContainer: '<h1>$</h1>',
    html: defaultHTML,
    mountElementId: 'root',
  });
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toMatch('window.g_initialProps = {"username":"$"};');
  expect(html).toMatch('<div id="root"><h1>$</h1></div>');
  expect(html).toContain('</html>');
});

test('handleHTML using removeWindowInitialProps', async () => {
  const html = await handleHTML({
    pageInitialProps: {
      username: 'ycjcl868',
    },
    removeWindowInitialProps: true,
    rootContainer: '<h1>ycjcl868</h1>',
    html: defaultHTML,
    mountElementId: 'root',
  });
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).not.toMatch('window.g_initialProps');
  expect(html).toMatch('<div id="root"><h1>ycjcl868</h1></div>');
  expect(html).toContain('</html>');
});

test('handleHTML using forceInitial', async () => {
  const html = await handleHTML({
    pageInitialProps: {
      username: 'ycjcl868',
    },
    rootContainer: '<h1>ycjcl868</h1>',
    forceInitial: true,
    html: defaultHTML,
    mountElementId: 'root',
  });
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toMatch('window.g_initialProps = null;');
  expect(html).toMatch('<div id="root"><h1>ycjcl868</h1></div>');
  expect(html).toContain('</html>');
});

test('handleHTML stream', (done) => {
  handleHTML({
    pageInitialProps: {
      username: 'ycjcl868',
    },
    mode: 'stream',
    rootContainer: renderToStaticNodeStream(<h1>ycjcl868</h1>),
    html: defaultHTML,
    mountElementId: 'root',
  }).then((html) => {
    expect(html instanceof Stream).toBeTruthy();
    expect(html instanceof Stream).toBeTruthy();
    let bytes = Buffer.from('');
    (html as MergedStream).on('data', (chunk) => {
      bytes = Buffer.concat([bytes, chunk]);
    });
    (html as MergedStream).on('end', () => {
      expect(bytes.toString()).toContain('<!DOCTYPE html>');
      expect(bytes.toString()).toContain(
        '<div id="root"><h1>ycjcl868</h1></div>',
      );
      expect(bytes.toString()).toContain('</html>');
      done();
    });
  });
});

test('handleHTML dynamicImport', async () => {
  const opts = {
    pageInitialProps: {
      username: 'ycjcl868',
    },
    rootContainer: '<h1>ycjcl868</h1>',
    html: defaultHTML,
    dynamicImport: true,
    manifest: {
      'p__index.css': '/public/p__index.chunk.css',
      'p__index.js': '/public/p__index.js',
      'p__users.css': '/public/p__users.chunk.css',
      'p__users.js': '/public/p__users.js',
      'umi.css': '/public/umi.css',
      'umi.js': '/public/umi.js',
      'vendors~p__index.css': '/public/vendors~p__index.chunk.css',
      'vendors~p__index.js': '/public/vendors~p__index.js',
      'index.html': '/public/index.html',
      _chunksMap: {
        'umi': ['/public/umi.css', '/public/umi.js'],
        'vendors~p__index': ['/public/vendors~p__index.chunk.css', '/public/vendors~p__index.js'],
        'p__index': ['/public/p__index.chunk.css', '/public/p__index.js'],
        'p__users': ['/public/p__users.chunk.css', '/public/p__users.js'],
      }
    },
    mountElementId: 'root',
  };
  const homeHTML = await handleHTML({
    ...opts,
    routesMatched: [
      {
        route: {
          path: '/',
          _chunkName: 'p__index',
        },
      },
    ],
  });
  expect(homeHTML).toContain('/public/p__index.chunk.css');

  const usersHTML = await handleHTML({
    ...opts,
    routesMatched: [
      {
        route: {
          path: '/users',
          _chunkName: 'p__users',
        },
      },
    ],
  });
  expect(usersHTML).toContain('/public/p__users.chunk.css');

  const withLayoutHTML = await handleHTML({
    ...opts,
    routesMatched: [
      {
        route: {
          path: '/',
          _chunkName: 'p__index',
        },
      },
      {
        route: {
          path: '/users',
          _chunkName: 'p__users',
        },
      },
    ],
  });
  expect(withLayoutHTML).toContain('/public/p__index.chunk.css');
  expect(withLayoutHTML).toContain('/public/p__users.chunk.css');

  const normalHTMl = await handleHTML({
    ...opts,
    routesMatched: [
      {
        route: {
          path: '/',
          _chunkName: '',
        },
      },
    ],
  });
  expect(normalHTMl).not.toContain('/public/p__index.chunk.css');
  expect(normalHTMl).not.toContain('/public/p__users.chunk.css');
});

test('handleHTML complex', async () => {
  const complexOpts = {
    pageInitialProps: {
      username: 'ycjcl868',
    },
    rootContainer: '<h1>ycjcl868</h1>',
    html: defaultHTML,
    dynamicImport: true,
    manifest: {
      'layouts__index.css': '/layouts__index.chunk.css',
      'layouts__index.js': '/layouts__index.js',
      'p__index.css': '/p__index.chunk.css',
      'p__index.js': '/p__index.js',
      'p__me.css': '/p__me.chunk.css',
      'p__me.js': '/p__me.js',
      'umi.css': '/umi.css',
      'umi.js': '/umi.js',
      'wrappers.css': '/wrappers.chunk.css',
      'wrappers.js': '/wrappers.js',
      'index.html': '/index.html',
      _chunksMap: {
        'umi': ['/umi.css', '/umi.js'],
        'layouts__index': ['/layouts__index.chunk.css', '/layouts__index.js'],
        'p__index': ['/p__index.chunk.css', '/p__index.js'],
        'p__me': ['/p__me.chunk.css', '/p__me.js'],
        'wrappers': ['/wrappers.chunk.css', '/wrappers.js'],
      }
    },
    mountElementId: 'root',
  };
  const complexHTMl = await handleHTML({
    ...complexOpts,
    routesMatched: [
      {
        route: {
          path: '/',
          routes: [
            {
              path: '/about',
              wrappers: [null],
              routes: [{ path: '/about/me', exact: true, _chunkName: 'p__me' }],
              _chunkName: 'p__index',
            },
          ],
          _chunkName: 'layouts__index',
        },
        match: { path: '/', url: '/', isExact: false, params: {} },
      },
      {
        route: {
          path: '/about',
          wrappers: [null],
          routes: [{ path: '/about/me', exact: true, _chunkName: 'p__me' }],
          _chunkName: 'p__index',
        },
        match: {
          path: '/about',
          url: '/about',
          isExact: true,
          params: {},
        },
      },
    ],
  });
  expect(complexHTMl).toContain('/layouts__index.chunk.css');
  expect(complexHTMl).toContain('/p__index.chunk.css');
  expect(complexHTMl).toContain('/wrappers.chunk.css');
});

test('ReadableString', (done) => {
  const wrapperStream = new ReadableString('<div></div>');
  let bytes = Buffer.from('');
  wrapperStream.on('data', (chunk) => {
    bytes = Buffer.concat([bytes, chunk]);
  });
  wrapperStream.on('end', () => {
    expect(bytes.toString()).toContain('<div></div>');
    done();
  });
});
