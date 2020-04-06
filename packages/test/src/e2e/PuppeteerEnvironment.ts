import NodeEnvironment from 'jest-environment-jsdom-fourteen';
import getBrowser from './getBrowser';
import Puppeteer from 'puppeteer-core';

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    const browser = await getBrowser();
    const page = await browser.newPage();
    this.global.browser = browser;
    this.global.page = page;
    await page.setViewport({
      width: 1440,
      height: 800,
    });

    /**
     * 滑动到页面底部，然后截图
     * 是为了解决懒加载的问题
     * @param rest
     */
    const fullPageScreenshot: (
      option?: Puppeteer.ScreenshotOptions,
    ) => Promise<string | Buffer> = async (options) => {
      const totalHeight = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
              const { scrollHeight } = document.body;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve(totalHeight);
              }
            }, 100);
          }),
      );
      page.setViewport({
        width: 1440,
        height: totalHeight,
      });
      const image = await page.screenshot(options);
      return image;
    };

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
    this.global.page.fullPageScreenshot = fullPageScreenshot;
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
