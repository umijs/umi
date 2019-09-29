import puppeteer from 'puppeteer';

describe('Umi UI e2e', () => {
  let browser;
  let page;
  const port = process.env.UMI_UI_PORT || 3000;
  const url = `http://localhost:${port}`;

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

  describe('project manager page', () => {
    it('project list normal', async () => {
      console.log('ui server url: ', url);
      await page.goto(`${url}/project/select`, { waitUntil: 'networkidle2' });

      const text = await page.evaluate(
        () => document.querySelector('[data-test-id="project-title"]').innerHTML,
      );
      // not inject analyze script
      const gaScript = await page.evaluate(() => {
        const ga = document.querySelector('script[src*=analytics]');
        return ga && ga.src;
      });

      expect(text).toEqual('项目列表');
      expect(gaScript).toBeNull();
    }, 10000);
  });

  it('project import', async () => {
    await page.goto(`${url}/project/select`);

    await page.setViewport({ width: 1680, height: 866 });

    await page.waitForSelector('[data-test-id="project-action-import"]');
    await page.click('[data-test-id="project-action-import"]');

    const formTagName = await page.evaluate(
      () => document.querySelector('#form_create_project').tagName,
    );
    expect(formTagName).toEqual('FORM');
  }, 10000);
});
