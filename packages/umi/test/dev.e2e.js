import puppeteer from 'puppeteer';
import got from 'got';
import FormData from 'form-data';
import { existsSync } from 'fs';
import { winPath } from 'umi-utils';
import { join } from 'path';

describe('normal', () => {
  let browser;
  let page;
  const port = 12341;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterAll(done => {
    if (browser) {
      browser.close();
    }
    done();
  });

  it('index page', async () => {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });

    // window.g_routes
    const routes = await page.evaluate(() => window.g_routes);
    expect(routes[0].path).toEqual('/');

    // app.js -> onRouteChange
    const pathname = await page.evaluate(() => window.g_location_pathname);
    expect(pathname).toEqual('/');

    // global.js
    const text = await page.evaluate(() => document.querySelector('h1').innerHTML);
    expect(text).toEqual('index');

    // layout
    const layoutLength = await page.evaluate(() => document.querySelectorAll('#layout').length);
    expect(layoutLength).toEqual(1);

    // css modules
    const h1ClassName = await page.evaluate(() => document.querySelector('h1').className);
    expect(h1ClassName.indexOf('index__a___')).toEqual(0);
    const color = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).color);
    expect(color).toEqual('rgb(255, 255, 255)');

    // global.css
    const backgroundColor = await page.evaluate(
      () => getComputedStyle(document.querySelector('h1')).backgroundColor,
    );
    expect(backgroundColor).toEqual('rgb(0, 128, 0)');
  });

  it('404 page', async () => {
    await page.goto(`http://localhost:${port}/404`, {
      waitUntil: 'networkidle2',
    });
    const text = await page.evaluate(() => document.querySelector('h1').innerHTML);
    expect(text).toEqual('404');
  });

  it('umi development 404 page', async () => {
    await page.goto(`http://localhost:${port}/page-dont-exists`, {
      waitUntil: 'networkidle2',
    });
    const text = await page.evaluate(() => document.querySelector('h1').innerHTML);
    expect(text).toEqual('umi development 404 page');
  });

  it('mock', async () => {
    let res;

    // GET
    res = await got(`http://localhost:${port}/api/users`);
    expect(res.body).toEqual('{"name":"cc"}');

    // POST
    res = await got(`http://localhost:${port}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"a":"b"}',
    });
    expect(res.body).toEqual('{"body":{"a":"b"}}');

    // POST with form
    res = await got(`http://localhost:${port}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: { a: 'b' },
      form: true,
    });
    expect(res.body).toEqual('{"body":{"a":"b"}}');

    // POST with form-data (multipart)
    const form = new FormData();
    form.append('foo', 'bar');
    form.append('ccc', 'ddd');
    res = await got(`http://localhost:${port}/api/users`, {
      method: 'POST',
      body: form,
    });
    expect(res.body).toEqual('{"body":{"foo":"bar","ccc":"ddd"}}');

    // PUT
    res = await got(`http://localhost:${port}/api/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"a":"b"}',
    });
    expect(res.body).toEqual('{"body":{"a":"b"}}');

    // DELETE
    res = await got(`http://localhost:${port}/api/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"a":"b"}',
    });
    expect(res.body).toEqual('{"body":{"a":"b"}}');

    // PATCH
    res = await got(`http://localhost:${port}/api/users`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"a":"b"}',
    });
    expect(res.body).toEqual('{"body":{"a":"b"}}');
  });

  it('use proxy when not find mock', async () => {
    const res = await got(`http://localhost:${port}/proxy/proxytest`);
    expect(res.body).toEqual('{"data":"proxytest"}');
    const res1 = await got(`http://localhost:${port}/proxy/proxytest1`);
    expect(res1.body).toEqual('{"data":"proxytest1"}');
  });

  it('routes', async () => {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
    await page.click('button');
    await page.waitForSelector('h1');
    const listText = await page.evaluate(() => document.querySelector('h1').innerHTML);
    expect(listText).toEqual('list');
    await page.click('button');
    await page.waitForSelector('h1');
    const indexText = await page.evaluate(() => document.querySelector('h1').innerHTML);
    expect(indexText).toEqual('index');
  });
});

describe('ssr', () => {
  // port: 12342, not use puppeteer
  beforeEach(async () => {
    // TODO: maybe using umi/server, reset global
    global.window = {};
  });

  afterAll(done => {
    done();
  });

  it('routes', async () => {
    const ssrFile = join(winPath(__dirname), 'fixtures', 'dev', 'ssr', 'dist', 'umi.server.js');
    const manifestFile = join(
      winPath(__dirname),
      'fixtures',
      'dev',
      'ssr',
      'dist',
      'ssr-client-mainifest.json',
    );
    expect(existsSync(ssrFile)).toBeTruthy();
    expect(existsSync(manifestFile)).toBeTruthy();

    const serverRender = require('./fixtures/dev/ssr/dist/umi.server');
    const manifest = require('./fixtures/dev/ssr/dist/ssr-client-mainifest.json');
    // export react-dom/server to avoid React hooks ssr error
    const { ReactDOMServer } = serverRender;

    const ctx = {
      req: {
        url: '/',
      },
    };

    const { rootContainer } = await serverRender.default(ctx);
    const ssrHtml = ReactDOMServer.renderToString(rootContainer);

    expect(ssrHtml).toContain('Hello UmiJS SSR');
    expect(ssrHtml).toContain('<ul><li>Alice</li><li>Jack</li><li>Tony</li></ul>');
    expect(manifest).toEqual({
      '/': { js: ['umi.js'], css: ['umi.css'] },
      __404: { js: ['umi.js'], css: ['umi.css'] },
    });
  });

  describe('ssr styles', () => {
    beforeEach(async () => {
      // TODO: maybe using umi/server, reset global
      global.window = {};
    });

    afterAll(done => {
      done();
    });

    it('routes', async () => {
      const ssrFile = join(
        winPath(__dirname),
        'fixtures',
        'dev',
        'ssr-styles',
        'dist',
        'umi.server.js',
      );
      const manifestFile = join(
        winPath(__dirname),
        'fixtures',
        'dev',
        'ssr-styles',
        'dist',
        'ssr-client-mainifest.json',
      );
      expect(existsSync(ssrFile)).toBeTruthy();
      expect(existsSync(manifestFile)).toBeTruthy();

      const serverRender = require('./fixtures/dev/ssr-styles/dist/umi.server');
      const manifest = require('./fixtures/dev/ssr-styles/dist/ssr-client-mainifest.json');
      // export react-dom/server to avoid React hooks ssr error
      const { ReactDOMServer } = serverRender;

      expect(manifest).toEqual({
        '/': {
          js: ['umi.js'],
          css: ['umi.css'],
        },
        '/news': {
          js: ['umi.js'],
          css: ['umi.css'],
        },
        __404: {
          js: ['umi.js'],
          css: ['umi.css'],
        },
      });

      const ctx = {
        req: {
          url: '/',
        },
      };

      const { rootContainer } = await serverRender.default(ctx);
      const ssrHtml = ReactDOMServer.renderToString(rootContainer);

      expect(ssrHtml).toEqual(
        '<div class="wrapper" data-reactroot=""><h1>Hello UmiJS SSR Styles</h1><ul><li>Alice</li><li>Jack</li><li>Tony</li></ul><button>0</button></div>',
      );

      const ctx2 = {
        req: {
          url: '/news',
        },
      };

      const { rootContainer: rootContainerNews } = await serverRender.default(ctx2);
      const ssrHtmlNews = ReactDOMServer.renderToString(rootContainerNews);

      expect(ssrHtmlNews).toContain(
        '<div class="news" data-reactroot=""><h1>Hello UmiJS SSR Styles</h1></div>',
      );
    });
  });
});
