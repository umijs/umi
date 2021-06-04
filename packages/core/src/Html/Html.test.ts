import { join } from 'path';
import Html from './Html';

const fixtures = join(__dirname, 'fixtures');

test('getContent', async () => {
  const html = new Html({
    config: {},
  });
  const content = await html.getContent({
    route: { path: '/' },
  });
  expect(content.trim()).toEqual(
    `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
    />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
  `.trim(),
  );
});

test('getContent failed if tplPath not exists', async () => {
  const html = new Html({
    config: {},
  });
  try {
    await html.getContent({
      route: { path: '/' },
      tplPath: join(fixtures, 'not-found-tpl'),
    });
  } catch (e) {
    expect(e.message).toMatch(/getContent\(\) failed, tplPath of/);
  }
});

test('getContent with config.mountElementId', async () => {
  const html = new Html({
    config: {
      mountElementId: 'foo',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
    tplPath: join(fixtures, 'custome-tpl.ejs'),
  });
  expect(content).toContain(`<div id="foo"></div>`);
});

test('getContent with opts.metas', async () => {
  const html = new Html({
    config: {},
  });
  const content = await html.getContent({
    route: { path: '/' },
    metas: [{ foo: 'bar' }],
  });
  expect(content).toContain('<meta foo="bar" />');
});

// config.title don't generate <title> tag anymore
xtest('getContent with config.title', async () => {
  const html = new Html({
    config: {
      title: 'foo',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
  });
  expect(content).toContain('<title>foo</title>');
});

test('getContent with opts.cssFiles', async () => {
  const html = new Html({
    config: {
      publicPath: '/',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
    cssFiles: ['foo.css'],
  });
  expect(content).toContain('<link rel="stylesheet" href="/foo.css" />');
});

test('getContent with opts.jsFiles', async () => {
  const html = new Html({
    config: {
      publicPath: '/',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
    jsFiles: ['foo.js'],
  });
  expect(content.split('<body>')[1]).toContain(
    '<script src="/foo.js"></script>',
  );
});

test('getContent with opts.headJSFiles', async () => {
  const html = new Html({
    config: {
      publicPath: '/',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
    headJSFiles: ['foo.js'],
  });
  expect(content.split('</head>')[0]).toContain(
    '<script src="/foo.js"></script>',
  );
});

test('getContent with scripts', async () => {
  const html = new Html({
    config: {
      publicPath: '/',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
    headScripts: [{ content: 'console.log(123);' }],
    scripts: [{ src: '//a.ali.com/a.js' }],
  });
  expect(content.split('</head>')[0]).toContain('console.log(123);');
  expect(content.split('<body>')[1]).toContain(
    '<script src="//a.ali.com/a.js"></script>',
  );
});

test('getContent with css', async () => {
  const html = new Html({
    config: {
      publicPath: '/',
    },
  });
  const content = await html.getContent({
    route: { path: '/' },
    links: [{ rel: 'stylesheet', href: '//a.alicdn.com/a.css' }],
    styles: [{ content: '.a{color: red;}' }],
  });
  expect(content.split('</head>')[0]).toContain(
    '<link rel="stylesheet" href="//a.alicdn.com/a.css" />',
  );
  expect(content.split('</head>')[0]).toContain('color: red;');
});

test('getAssets', () => {
  const html = new Html({
    config: {
      publicPath: '/foo/',
    },
  });
  expect(
    html.getAsset({
      file: 'a.css',
    }),
  ).toEqual('/foo/a.css');
  expect(
    html.getAsset({
      file: '/b/bar.js',
    }),
  ).toEqual('/foo/b/bar.js');
  expect(
    html.getAsset({
      file: 'https://a.com/b.jpg',
    }),
  ).toEqual('https://a.com/b.jpg');
});
