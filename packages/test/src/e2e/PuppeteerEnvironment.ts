import NodeEnvironment from 'jest-environment-jsdom-fourteen';
import getBrowser from './getBrowser';

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    const browser = await getBrowser();

    if (this.global.page) {
      await this.global.page.close();
    }

    const page = await browser.newPage();
    this.global.browser = browser;
    this.global.page = page;

    const setFamily = async () => {
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            const link = document.createElement('style') as any;
            link.href = 'https://fonts.googleapis.com/css?family=Roboto+Mono';
            link.rel = 'stylesheet';
            const style = document.createElement('style');
            const textNode = document.createTextNode(`
                *{
                  font-family: 'Roboto Mono', monospace !important; 
                }
              `);
            style.appendChild(textNode);
            link.onload = () => {
              resolve();
            };
            document.head.appendChild(link);
            document.head.appendChild(style);
          }),
      );
    };

    const getText = () => page.evaluate(() => document.body.innerText);

    const waitTime = (timeout: number) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, timeout);
      });
    };

    // 获取用户台的输出
    page.on('console', (msg) => {
      if (msg.type.toString() === 'error') {
        console.log('PAGE LOG:', msg.text());
      }
    });

    this.global.waitTime = waitTime;
    this.global.page.setFamily = setFamily;
    this.global.page.getText = getText;
  }

  async teardown() {
    const { page, browser } = this.global;

    if (page) {
      await page.close();
    }

    if (browser) {
      await browser.disconnect();
    }

    if (browser) {
      await browser.close();
    }
  }
}

export default PuppeteerEnvironment;
