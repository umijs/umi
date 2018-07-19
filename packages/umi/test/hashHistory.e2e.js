import puppeteer from 'puppeteer';

describe('hashHistory', () => {
  let browser;
  let page;
  const port = 12342;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  it('access hash style history', async () => {
    await page.goto(`http://localhost:${port}/#/list`, {
      waitUntil: 'networkidle2',
    });
    const text = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(text).toEqual('list');
  });

  afterAll(() => {
    browser.close();
  });
});
