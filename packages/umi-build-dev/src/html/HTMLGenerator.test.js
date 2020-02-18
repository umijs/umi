import { join } from 'path';
import { winEOL } from 'umi-utils';
import HTMLGenerator from './HTMLGenerator';

describe('HG', () => {
  it('getFlatRoutes', () => {
    const hg = new HTMLGenerator();
    const result = hg.getFlatRoutes([
      {
        path: '/a',
        routes: [{ path: '/a/b', component: './a/b' }],
      },
      { path: '/b', component: './b' },
      { component: './c' },
    ]);
    expect(result).toEqual([
      { path: '/a' },
      { path: '/a/b', component: './a/b' },
      { path: '/b', component: './b' },
    ]);
  });

  it('getHtmlPath', () => {
    const hg = new HTMLGenerator({
      config: {
        mountElementId: 'root',
      },
    });
    expect(hg.getHtmlPath('/')).toEqual('index.html');
    expect(hg.getHtmlPath('/a')).toEqual('a/index.html');
    expect(hg.getHtmlPath('/a/')).toEqual('a/index.html');
  });

  it('getHtmlPath with exportStatic.htmlSuffix = true', () => {
    const hg = new HTMLGenerator({
      config: {
        exportStatic: { htmlSuffix: true },
        mountElementId: 'root',
      },
    });
    expect(hg.getHtmlPath('/')).toEqual('index.html');
    expect(hg.getHtmlPath('/a.html')).toEqual('a.html');
  });

  it('getLinksContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getLinksContent([
      { rel: 'stylesheet', href: './a.css' },
      { a: 1, c: 'd', e: true },
    ]);
    expect(result).toEqual(
      `
<link rel="stylesheet" href="./a.css" />
<link a="1" c="d" e="true" />
    `.trim(),
    );
  });

  it('getMetasContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getMetasContent([{ a: 1, c: 'd', e: true }]);
    expect(result).toEqual(
      `
<meta a="1" c="d" e="true" />
    `.trim(),
    );
  });

  it('getScriptsContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getScriptsContent([
      { src: './a.js' },
      { src: './a.js', crossorigin: 'anonymous' },
      { content: "alert('hello');\nalert('umi');", a: 'b' },
    ]);
    expect(result).toEqual(
      `
<script src="./a.js"></script>
<script src="./a.js" crossorigin="anonymous"></script>
<script a="b">
  alert('hello');
  alert('umi');
</script>
    `.trim(),
    );
  });

  it('getStylesContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getStylesContent([{ content: 'body { color: red; }', a: 'b' }]);
    expect(result).toEqual(
      `
<style a="b">
  body { color: red; }
</style>
    `.trim(),
    );
  });

  it('getContent', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      minify: false,
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      modifyLinks: links => {
        links.push({
          rel: 'stylesheet',
          href: 'http://ant.design/test.css',
        });
        return links;
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="http://ant.design/test.css" />
<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent with chunks', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
        a: ['a.js'],
        b: ['b.js', 'b.css'],
        c: ['c.js', 'c.css'],
      },
      minify: false,
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      modifyChunks() {
        return ['a', { name: 'b', headScript: true }, 'umi', 'c'];
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="/b.css" />
<link rel="stylesheet" href="/umi.css" />
<link rel="stylesheet" href="/c.css" />
<script>
  window.routerBase = "/";
</script>
<script src="/b.js"></script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/a.js"></script>
<script src="/umi.js"></script>
<script src="/c.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent with publicPath', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      minify: false,
      publicPath: '/foo/',
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document-with-publicPath.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="/foo/umi.css" />
<script>
  window.routerBase = "/";
</script>
</head>
<body>
<img src="/foo/a.jpg" />
<div id="documenttestid"></div>
<script src="/foo/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent with runtimePublicPath', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      minify: false,
      config: {
        runtimePublicPath: true,
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
  window.publicPath = "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent with runtimePublicPath string', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      minify: false,
      config: {
        runtimePublicPath: 'window.__injected_runtime_public_path__ || "/"',
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
  window.publicPath = window.__injected_runtime_public_path__ || "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent in development', () => {
    const hg = new HTMLGenerator({
      env: 'development',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getRoute and minify', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: true,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(winEOL(content.trim())).toEqual(
      `
<head><link rel="stylesheet" href="/umi.css"><script>window.routerBase = "/";</script></head><body><div id="documenttestid"></div><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('getRoute dynamicRoot', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: {
          dynamicRoot: true,
        },
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });

    const c1 = hg.getContent({
      path: '/',
    });
    expect(winEOL(c1.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="./umi.css" />
<script>
  window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + window.routerBase;
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="./umi.js"></script>
</body>
    `.trim(),
    );

    const c2 = hg.getContent({
      path: '/a',
    });
    expect(c2.includes('"../umi.js"') && c2.includes('"../umi.css"')).toEqual(true);
    const c3 = hg.getContent({
      path: '/a/b',
    });
    expect(c3.includes('"../../umi.js"') && c3.includes('"../../umi.css"')).toEqual(true);
  });

  it('getRoute dynamicRoot with exportStatic.htmlSuffix = true', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: {
          htmlSuffix: true,
          dynamicRoot: true,
        },
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });

    const c1 = hg.getContent({
      path: '/',
    });
    expect(winEOL(c1.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="./umi.css" />
<script>
  window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + window.routerBase;
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="./umi.js"></script>
</body>
    `.trim(),
    );

    const c2 = hg.getContent({
      path: '/a',
    });
    expect(c2.includes('"./umi.js"') && c2.includes('"./umi.css"')).toEqual(true);
    const c3 = hg.getContent({
      path: '/a/b',
    });
    expect(c3.includes('"../umi.js"') && c3.includes('"../umi.css"')).toEqual(true);
  });

  it('getMatchedContent', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      routes: [
        { path: '/a' },
        {
          path: '/b',
          routes: [{ path: '/b/c' }],
        },
        { path: '/c/d' },
        { path: '/e/:id' },
      ],
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"/umi.js"') && c1.includes('"/umi.css"')).toEqual(true);
    const c2 = hg.getMatchedContent('/a/b');
    expect(c2.includes('"/umi.js"') && c2.includes('"/umi.css"')).toEqual(true);
  });

  it('getMatchedContent with exportStatic', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: {
          htmlSuffix: true,
          dynamicRoot: true,
        },
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      routes: [
        { path: '/a' },
        {
          path: '/b',
          routes: [
            {
              path: '/b/c',
            },
          ],
        },
        { path: '/c/d' },
        { path: '/e/:id' },
      ],
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"./umi.js"') && c1.includes('"./umi.css"')).toEqual(true);
    const c2 = hg.getMatchedContent('/b/c');
    expect(c2.includes('"../umi.js"') && c2.includes('"../umi.css"')).toEqual(true);
    const c3 = hg.getMatchedContent('/c');
    expect(c3.includes('"./umi.js"') && c3.includes('"./umi.css"')).toEqual(true);
    const c4 = hg.getMatchedContent('/e/123');
    expect(c4.includes('"../umi.js"') && c4.includes('"../umi.css"')).toEqual(true);
  });

  it('getMatchedContent with exportStatic and context', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: true,
        mountElementId: 'root',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/custom-doc-with-context.ejs'),
      },
      routes: [
        { path: '/a' },
        {
          path: '/b',
          routes: [
            {
              path: '/b/c',
              title: 'bctitle',
            },
          ],
        },
      ],
      modifyContext: (context, { route }) => {
        return {
          ...context,
          path: route.path,
          title: route.title || 'defaultTitle',
        };
      },
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"/umi.js"') && c1.includes('"/umi.css"')).toEqual(true);
    expect(c1.includes('<title>defaultTitle-/a</title>')).toEqual(true);
    const c2 = hg.getMatchedContent('/b/c');
    expect(c2.includes('"/umi.js"') && c2.includes('"/umi.css"')).toEqual(true);
    expect(c2.includes('<title>bctitle-/b/c</title>')).toEqual(true);
  });

  it('get content with default document when title is undefined', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      config: {
        mountElementId: 'root',
      },
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, '../../template/document.ejs'),
      },
      routes: [{ path: '/a' }],
      modifyContext: context => {
        return context;
      },
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"/umi.js"') && c1.includes('"/umi.css"')).toEqual(true);
    expect(c1.includes('<title>')).toEqual(false);
  });

  it('getMatchedContent with ssr and context', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        ssr: true,
        mountElementId: 'root',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/custom-doc-with-context.ejs'),
      },
      routes: [
        { path: '/a' },
        {
          path: '/b',
          routes: [
            {
              path: '/b/c',
              title: 'bctitle',
            },
          ],
        },
      ],
      modifyContext: (context, { route }) => {
        return {
          ...context,
          path: route.path,
          title: route.title || 'defaultTitle',
        };
      },
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"/umi.js"') && c1.includes('"/umi.css"')).toEqual(true);
    expect(c1.includes('<title>defaultTitle-/a</title>')).toEqual(true);
    const c2 = hg.getMatchedContent('/b/c');
    expect(c2.includes('"/umi.js"') && c2.includes('"/umi.css"')).toEqual(true);
    expect(c2.includes('<title>bctitle-/b/c</title>')).toEqual(true);
  });

  it('getContent with include', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        mountElementId: 'root',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document-with-include.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });

    expect(winEOL(content.trim())).toEqual(
      `
<head>

<link rel="stylesheet" href="/umi.css" />

  <title>custom</title>
  <script>
window.inject = {
  foo: 'bar'
}
</script><script>
  window.routerBase = "/";
</script>
</head>
<body>
<div id="root"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });
});
