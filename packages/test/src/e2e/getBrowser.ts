//@ts-ignore
import findChrome from 'carlo/lib/find_chrome';
import * as Puppeteer from 'puppeteer-core';

const puppeteerArgs = [
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--no-first-run',
  '--no-zygote',
  '--no-sandbox',
  '--font-render-hinting=medium',
];

const timeout = 60000;

const headless = process.env.HEADLESS === 'none' ? false : true;

const PuppeteerConfig = {
  args: puppeteerArgs,
  timeout,
  headless,
  defaultViewport: {
    width: 1440,
    height: 800,
    deviceScaleFactor: 2,
  },
  dumpio: true,
};

const getBrowser = async (): Promise<Puppeteer.Browser> => {
  try {
    // eslint-disable-next-line import/no-unresolved
    const puppeteer: typeof Puppeteer = require('puppeteer');
    const browser = await puppeteer.launch(PuppeteerConfig);
    return browser;
  } catch (error) {
    // console.log(error)
  }

  try {
    // eslint-disable-next-line import/no-unresolved
    const puppeteer: typeof Puppeteer = require('puppeteer-core');
    const findChromePath = await findChrome({});
    const { executablePath } = findChromePath;
    const browser = await puppeteer.launch({
      ...PuppeteerConfig,
      executablePath,
    });
    return browser;
  } catch (error) {
    console.log(error);
    console.log('🧲 no find chrome');
  }
  throw new Error('no find puppeteer');
};

export default getBrowser;
