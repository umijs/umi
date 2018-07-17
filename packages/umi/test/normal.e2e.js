import puppeteer from 'puppeteer';
import got from 'got';
import { join } from 'path';
import startDevServer from './startDevServer';

const PORT = '12345';

describe('normal', () => {
  let browser;
  let page;
  let devProcess;

  beforeAll(async () => {
    devProcess = await startDevServer({
      port: PORT,
      cwd: join(__dirname, './normal'),
    });
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  it('index page', async () => {
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });

    // global.js
    const text = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(text).toEqual('index');

    // layout
    const layoutLength = await page.evaluate(
      () => document.querySelectorAll('#layout').length,
    );
    expect(layoutLength).toEqual(1);

    // css modules
    const h1ClassName = await page.evaluate(
      () => document.querySelector('h1').className,
    );
    expect(h1ClassName.indexOf('index__a___')).toEqual(0);
    const color = await page.evaluate(
      () => getComputedStyle(document.querySelector('h1')).color,
    );
    expect(color).toEqual('rgb(255, 255, 255)');

    // global.css
    const backgroundColor = await page.evaluate(
      () => getComputedStyle(document.querySelector('h1')).backgroundColor,
    );
    expect(backgroundColor).toEqual('rgb(0, 128, 0)');
  });

  it('404 page', async () => {
    await page.goto(`http://localhost:${PORT}/404`, {
      waitUntil: 'networkidle2',
    });
    const text = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(text).toEqual('404');
  });

  it('umi development 404 page', async () => {
    await page.goto(`http://localhost:${PORT}/page-dont-exists`, {
      waitUntil: 'networkidle2',
    });
    const text = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(text).toEqual('umi development 404 page');
  });

  it('mock', async () => {
    const res = await got(`http://localhost:${PORT}/api/users`);
    expect(res.body).toEqual('{"name":"cc"}');
  });

  it('routes', async () => {
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
    await page.click('button');
    await page.waitForSelector('h1');
    const listText = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(listText).toEqual('list');
    await page.click('button');
    await page.waitForSelector('h1');
    const indexText = await page.evaluate(
      () => document.querySelector('h1').innerHTML,
    );
    expect(indexText).toEqual('index');
  });

  afterAll(() => {
    browser.close();
    devProcess.kill('SIGINT');
  });
});
