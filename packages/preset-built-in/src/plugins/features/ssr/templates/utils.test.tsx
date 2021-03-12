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
  expect(html).toContain('')
})

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
  expect(html).toMatch('window.g_initialProps = {"username":\"`$`\"};');
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
  }).then(html => {
    expect(html instanceof Stream).toBeTruthy();
    expect(html instanceof Stream).toBeTruthy();
    let bytes = Buffer.from('');
    html.on('data', (chunk) => {
      bytes = Buffer.concat([bytes, chunk]);
    });
    html.on('end', () => {
      expect(bytes.toString()).toContain('<!DOCTYPE html>');
      expect(bytes.toString()).toContain('<div id="root"><h1>ycjcl868</h1></div>');
      expect(bytes.toString()).toContain('</html>');
      done();
    });
  })
})

test('handleHTML dynamicImport', async () => {
  const opts = {
    pageInitialProps: {
      username: 'ycjcl868',
    },
    rootContainer: '<h1>ycjcl868</h1>',
    html: defaultHTML,
    dynamicImport: true,
    manifest: {
      "p__index.css": "/public/p__index.chunk.css",
      "p__index.js": "/public/p__index.js",
      "p__users.css": "/public/p__users.chunk.css",
      "p__users.js": "/public/p__users.js",
      "umi.css": "/public/umi.css",
      "umi.js": "/public/umi.js",
      "vendors~p__index.css": "/public/vendors~p__index.chunk.css",
      "vendors~p__index.js": "/public/vendors~p__index.js",
      "index.html": "/public/index.html",
    },
    mountElementId: 'root',
  }
  const homeHTML = await handleHTML({
    ...opts,
    routesMatched: [
      { route: {
        path: '/', _chunkName: 'p__index'
      } },
    ],
  });
  expect(homeHTML).toContain("/public/p__index.chunk.css");

  const usersHTML = await handleHTML({
    ...opts,
    routesMatched: [
      { route: {
        path: '/users', _chunkName: 'p__users'
      } },
    ],
  });
  expect(usersHTML).toContain("/public/p__users.chunk.css");

  const withLayoutHTML = await handleHTML({
    ...opts,
    routesMatched: [
      { route: {
        path: '/', _chunkName: 'p__index'
      } },
      { route: {
        path: '/users', _chunkName: 'p__users'
      } },
    ],
  });
  expect(withLayoutHTML).toContain("/public/p__index.chunk.css");
  expect(withLayoutHTML).toContain("/public/p__users.chunk.css");

  const normalHTMl = await handleHTML({
    ...opts,
    routesMatched: [
      { route: {
        path: '/', _chunkName: ''
      }},
    ],
  });
  expect(normalHTMl).not.toContain("/public/p__index.chunk.css");
  expect(normalHTMl).not.toContain("/public/p__users.chunk.css");
})

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
})
