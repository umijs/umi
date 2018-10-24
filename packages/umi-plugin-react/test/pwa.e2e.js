import puppeteer from 'puppeteer';
const rawManifestJSON = require('./pwa/manifest.json');

describe('pwa', () => {
  let browser;
  let page;
  const port = 12353;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  it('should inject `<meta>` and other webmanifest related tags in index page', async () => {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });

    // inject <link rel="manifest"> to <head>
    const manifestHref = await page.evaluate(
      () => document.head.querySelector('link[rel="manifest"]').href,
    );
    expect(manifestHref).toEqual(`http://localhost:${port}/manifest.json`);

    // inject async pwacompat.js to <head>
    const isAsync = await page.evaluate(
      () =>
        document.head.querySelector('script[src$="pwacompat.min.js"]').async,
    );
    expect(isAsync).toEqual(true);

    // inject 2 <link rel="icon">
    const linkIconNum = await page.evaluate(
      () => document.head.querySelectorAll('link[rel="icon"]').length,
    );
    expect(linkIconNum).toEqual(2);

    // inject <meta name="theme-color">
    const themeColor = await page.evaluate(
      () => document.head.querySelector('meta[name="theme-color"]').content,
    );
    expect(themeColor).toEqual('#1abc9c');
  });

  it('should generate correct webmanifest', async () => {
    page.on('response', async response => {
      const manifest = await response.json();
      expect(manifest.name).toEqual(rawManifestJSON.name);
      expect(manifest.short_name).toEqual(rawManifestJSON.short_name);
      expect(manifest.icons.length).toEqual(rawManifestJSON.icons.length);
    });

    await page.goto(`http://localhost:${port}/manifest.json`, {
      waitUntil: 'networkidle2',
    });
  });

  afterAll(() => {
    browser.close();
  });
});
