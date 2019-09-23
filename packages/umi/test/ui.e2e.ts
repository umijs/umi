import puppeteer from 'puppeteer';

describe('Umi UI e2e', () => {
  let browser;
  let page;
  const port = process.env.UMI_UI_PORT || 3000;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterAll(() => {
    if (browser) {
      browser.close();
    }
  });

  it('project list page', async () => {
    await page.goto(`http://localhost:${port}/project/select`, { waitUntil: 'networkidle2' });

    // global.js
    const text = await page.evaluate(() => document.querySelector('h2').innerHTML);
    expect(text).toEqual('项目列表');
  });
});
