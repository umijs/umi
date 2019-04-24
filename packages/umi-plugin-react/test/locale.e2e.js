import puppeteer from 'puppeteer';

describe('normal', () => {
  let browser;
  let page;
  const port = 12351;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  it('setLocale at global.js not reload page', async () => {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
    const text = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(text).toEqual('index');
  });

  afterAll(() => {
    browser.close();
  });
});
