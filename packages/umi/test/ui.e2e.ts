import puppeteer from 'puppeteer';

describe('Umi UI e2e', () => {
  let browser;
  let page;
  const port = process.env.UMI_UI_PORT || 3000;
  const url = `http://localhost:${port}`;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--no-sandbox',
      ],
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

  describe('project manager page', () => {
    it('project list normal', async () => {
      console.log('ui server url: ', url);
      await page.goto(`${url}/project/select`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-test-id="project-title"]');
      const text = await page.evaluate(
        () => document.querySelector('[data-test-id="project-title"]').textContent,
      );
      // not inject analyze script
      const gaScript = await page.evaluate(() => {
        const ga = document.querySelector('script[src*=analytics]');
        return ga && ga.src;
      });

      expect(text).toEqual('Project List');
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
