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

  it('index page', async () => {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
    const text = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(text).toEqual('index');

    // antd
    const antdBtnLength = await page.evaluate(
      () => document.querySelectorAll('.ant-btn-primary').length,
    );
    expect(antdBtnLength).toEqual(1);

    // antd-mobile
    const amBtnLength = await page.evaluate(
      () => document.querySelectorAll('.am-button-primary').length,
    );
    expect(amBtnLength).toEqual(1);

    // hd
    const dataScale = await page.evaluate(
      () => document.documentElement.dataset.scale,
    );
    expect(dataScale).toEqual('true');

    // title
    const titleText = await page.evaluate(
      () => document.querySelector('title').innerHTML,
    );
    expect(titleText).toEqual('默认标题');

    // scripts
    const scripts = await page.evaluate(() => window.scripts);
    expect(scripts).toEqual(['headScript1', 'script1', 'script2']);

    // links
    const link = await page.evaluate(() =>
      document.querySelector('#link1').getAttribute('foo'),
    );
    expect(link).toEqual('bar');

    // metas
    const meta = await page.evaluate(() =>
      document.querySelector('#meta1').getAttribute('foo'),
    );
    expect(meta).toEqual('/bar');
  });

  it('a page', async () => {
    await page.goto(`http://localhost:${port}/a`, {
      waitUntil: 'networkidle2',
    });

    // title
    const titleText = await page.evaluate(
      () => document.querySelector('title').innerHTML,
    );
    expect(titleText).toEqual('testpage');
  });

  afterAll(() => {
    browser.close();
  });
});
