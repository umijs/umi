import puppeteer from 'puppeteer';

describe('normal', () => {
  let browser;
  let page;
  const port = 12352;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  it('index page', async () => {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
    const text = await page.evaluate(
      () => document.querySelector('#user').innerHTML,
    );
    expect(text).toEqual('cc');
  });

  it('a page', async () => {
    await page.goto(`http://localhost:${port}/a`, {
      waitUntil: 'networkidle2',
    });
    const text = await page.evaluate(
      () => document.querySelector('.e2etest-a').innerHTML,
    );
    expect(text).toEqual('a page');
  });

  afterAll(() => {
    browser.close();
  });
});
