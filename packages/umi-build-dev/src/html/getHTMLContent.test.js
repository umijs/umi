import { join } from 'path';
import getHTMLContent from './getHTMLContent';

function getService(opts = {}) {
  const { cwd = join(__dirname, 'fixtures') } = opts;
  return {
    config: {},
    paths: {
      cwd,
      absPageDocumentPath: '$PAGE_DOC$',
      defaultDocumentPath: join(__dirname, 'fixtures', 'document.ejs'),
    },
    webpackConfig: { output: { publicPath: '/' } },
    libraryName: 'umi',
    applyPlugins(key, { initialValue }) {
      return initialValue;
    },
  };
}

const chunksMap = {
  'umi.js': 'umi-hash.js',
  'umi.css': 'umi-hash.css',
};

const chunksMapWithoutCSS = {
  'umi.js': 'umi-hash.js',
};

describe('getHTMLContent', () => {
  it('normal', () => {
    const service = getService();
    const html = getHTMLContent('/', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('child routes', () => {
    const service = getService();
    const html = getHTMLContent('/abc', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('child routes with config.exportStatic', () => {
    const service = getService();
    service.config.exportStatic = {};
    const html = getHTMLContent('/abc', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -2).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('child routes with last slash', () => {
    const service = getService();
    const html = getHTMLContent('/abc/', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -2).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('custom doc', () => {
    const service = getService();
    service.config.pages = {
      '/a': { document: './custom-doc.ejs' },
    };
    const html = getHTMLContent('/a', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head><title>custom</title></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('custom doc with context', () => {
    const service = getService();
    service.config.pages = {
      '/a': {
        document: './custom-doc-with-context.ejs',
        context: { title: 'a' },
      },
    };
    const html = getHTMLContent('/a', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head><title>a-/a</title></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('relative publicPath', () => {
    const service = getService();
    service.webpackConfig.output.publicPath = './s/';
    const html = getHTMLContent('/', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = location.origin + window.routerBase + './s/';</script><script src="./s/umi.js"></script></body>
    `.trim(),
    );
  });

  it('relative publicPath with child route', () => {
    const service = getService();
    service.webpackConfig.output.publicPath = './s/';
    const html = getHTMLContent('/abc/', service, chunksMap, true, false);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -2).concat('').join('/');
  window.publicPath = location.origin + window.routerBase + './s/';</script><script src="../s/umi.js"></script></body>
    `.trim(),
    );
  });

  it('production', () => {
    const service = getService();
    const html = getHTMLContent('/', service, chunksMap, true, true);
    expect(html.trim()).toEqual(
      `
<head><link rel="stylesheet" href="/umi-hash.css"></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi-hash.js"></script></body>
    `.trim(),
    );
  });

  it('production without css', () => {
    const service = getService();
    const html = getHTMLContent('/', service, chunksMapWithoutCSS, true, true);
    expect(html.trim()).toEqual(
      `
<head></head><body><div id="root"></div><script>window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = '/';</script><script src="/umi-hash.js"></script></body>
    `.trim(),
    );
  });
});
